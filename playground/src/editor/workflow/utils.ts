import type { JsonObject } from "@/editor/types";
import { ApplicationError } from "./errors";
import {
  parse as esprimaParse,
  Syntax,
  type Node as SyntaxNode,
  type ExpressionStatement,
} from "esprima-next";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isTraversableObject = (value: any): value is JsonObject => {
  return (
    value &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    !!Object.keys(value).length
  );
};

/**
 * Parse any JavaScript ObjectExpression, including:
 * - single quoted keys
 * - unquoted keys
 */
function parseJSObject(objectAsString: string): object {
  const jsExpression = esprimaParse(`(${objectAsString})`).body.find(
    (node): node is ExpressionStatement =>
      node.type === Syntax.ExpressionStatement &&
      node.expression.type === Syntax.ObjectExpression
  );

  return syntaxNodeToValue(jsExpression?.expression) as object;
}

type MutuallyExclusive<T, U> =
  | (T & { [k in Exclude<keyof U, keyof T>]?: never })
  | (U & { [k in Exclude<keyof T, keyof U>]?: never });

type JSONParseOptions<T> = { acceptJSObject?: boolean } & MutuallyExclusive<
  { errorMessage?: string },
  { fallbackValue?: T }
>;

/**
 * Parses a JSON string into an object with optional error handling and recovery mechanisms.
 *
 * @param {string} jsonString - The JSON string to parse.
 * @param {Object} [options] - Optional settings for parsing the JSON string. Either `fallbackValue` or `errorMessage` can be set, but not both.
 * @param {boolean} [options.acceptJSObject=false] - If true, attempts to recover from common JSON format errors by parsing the JSON string as a JavaScript Object.
 * @param {string} [options.errorMessage] - A custom error message to throw if the JSON string cannot be parsed.
 * @param {*} [options.fallbackValue] - A fallback value to return if the JSON string cannot be parsed.
 * @returns {Object} - The parsed object, or the fallback value if parsing fails and `fallbackValue` is set.
 */
export const jsonParse = <T>(
  jsonString: string,
  options?: JSONParseOptions<T>
): T => {
  try {
    return JSON.parse(jsonString) as T;
  } catch (error) {
    if (options?.acceptJSObject) {
      try {
        const jsonStringCleaned = parseJSObject(jsonString);
        return jsonStringCleaned as T;
      } catch (_e) {
        // Ignore this error and return the original error or the fallback value
      }
    }
    if (options?.fallbackValue !== undefined) {
      if (options.fallbackValue instanceof Function) {
        return options.fallbackValue();
      }
      return options.fallbackValue;
    } else if (options?.errorMessage) {
      throw new ApplicationError(options.errorMessage);
    }

    throw error;
  }
};

function syntaxNodeToValue(expression?: SyntaxNode | null): unknown {
  switch (expression?.type) {
    case Syntax.ObjectExpression:
      return Object.fromEntries(
        expression.properties
          .filter((prop) => prop.type === Syntax.Property)
          .map(({ key, value }) => [
            syntaxNodeToValue(key),
            syntaxNodeToValue(value),
          ])
      );
    case Syntax.Identifier:
      return expression.name;
    case Syntax.Literal:
      return expression.value;
    case Syntax.ArrayExpression:
      return expression.elements.map((exp) => syntaxNodeToValue(exp));
    default:
      return undefined;
  }
}

export type Primitives =
  | string
  | number
  | boolean
  | bigint
  | symbol
  | null
  | undefined;

export const deepCopy = <
  T extends ((object | Date) & { toJSON?: () => string }) | Primitives,
>(
  source: T,
  hash = new WeakMap(),
  path = ""
): T => {
  const hasOwnProp = Object.prototype.hasOwnProperty.bind(source);
  // Primitives & Null & Function
  if (
    typeof source !== "object" ||
    source === null ||
    typeof source === "function"
  ) {
    return source;
  }
  // Date and other objects with toJSON method
  // TODO: remove this when other code parts not expecting objects with `.toJSON` method called and add back checking for Date and cloning it properly
  if (typeof source.toJSON === "function") {
    return source.toJSON() as T;
  }
  if (hash.has(source)) {
    return hash.get(source);
  }
  // Array
  if (Array.isArray(source)) {
    const clone = [];
    const len = source.length;
    for (let i = 0; i < len; i++) {
      clone[i] = deepCopy(source[i], hash, path + `[${i}]`);
    }
    return clone as T;
  }
  // Object
  const clone = Object.create(Object.getPrototypeOf({}));
  hash.set(source, clone);
  for (const i in source) {
    if (hasOwnProp(i)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      clone[i] = deepCopy((source as any)[i], hash, path + `.${i}`);
    }
  }
  return clone;
};
