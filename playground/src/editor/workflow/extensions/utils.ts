import { DateTime } from "luxon";
import { ApplicationError, ExpressionExtensionError } from "../errors";

/**
 * 将不同类型的时间值（string、Date 或 DateTime）统一转换为一个 Luxon 的 DateTime 实例
 */
export const convertToDateTime = (
  value: string | Date | DateTime
): DateTime | undefined => {
  let converted: DateTime | undefined;

  if (typeof value === "string") {
    converted = DateTime.fromJSDate(new Date(value));
    if (converted.invalidReason !== null) {
      return;
    }
  } else if (value instanceof Date) {
    converted = DateTime.fromJSDate(value);
  } else if (DateTime.isDateTime(value)) {
    converted = value;
  }
  return converted;
};

export const tryToParseDateTime = (
  value: unknown,
  defaultZone?: string
): DateTime => {
  if (DateTime.isDateTime(value) && value.isValid) {
    // Ignore the defaultZone if the value is already a DateTime
    // because DateTime objects already contain the zone information
    return value;
  }

  if (value instanceof Date) {
    const fromJSDate = DateTime.fromJSDate(value, { zone: defaultZone });
    if (fromJSDate.isValid) {
      return fromJSDate;
    }
  }

  const dateString = String(value).trim();

  // Rely on luxon to parse different date formats
  const isoDate = DateTime.fromISO(dateString, {
    zone: defaultZone,
    setZone: true,
  });
  if (isoDate.isValid) {
    return isoDate;
  }
  const httpDate = DateTime.fromHTTP(dateString, {
    zone: defaultZone,
    setZone: true,
  });
  if (httpDate.isValid) {
    return httpDate;
  }
  const rfc2822Date = DateTime.fromRFC2822(dateString, {
    zone: defaultZone,
    setZone: true,
  });
  if (rfc2822Date.isValid) {
    return rfc2822Date;
  }
  const sqlDate = DateTime.fromSQL(dateString, {
    zone: defaultZone,
    setZone: true,
  });
  if (sqlDate.isValid) {
    return sqlDate;
  }

  const parsedDateTime = DateTime.fromMillis(Date.parse(dateString), {
    zone: defaultZone,
  });
  if (parsedDateTime.isValid) {
    return parsedDateTime;
  }

  throw new ApplicationError("Value is not a valid date", {
    extra: { dateString },
  });
};

export function checkIfValueDefinedOrThrow<T>(
  value: T,
  functionName: string
): void {
  if (value === undefined || value === null) {
    throw new ExpressionExtensionError(
      `${functionName} can't be used on ${String(value)} value`,
      {
        description: `To ignore this error, add a ? to the variable before this function, e.g. my_var?.${functionName}`,
      }
    );
  }
}

export function randomInt(max: number): number;
export function randomInt(min: number, max: number): number;
/**
 * Generates a random integer within a specified range.
 *
 * @param {number} min - The lower bound of the range. If `max` is not provided, this value is used as the upper bound and the lower bound is set to 0.
 * @param {number} [max] - The upper bound of the range, not inclusive.
 * @returns {number} A random integer within the specified range.
 */
export function randomInt(min: number, max?: number): number {
  if (max === undefined) {
    max = min;
    min = 0;
  }
  return min + (crypto.getRandomValues(new Uint32Array(1))[0] % (max - min));
}
