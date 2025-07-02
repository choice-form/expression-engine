import type { DocMetadata } from "@/editor/types";

export type Resolved = unknown;

export type ExtensionTypeName =
  | "number"
  | "string"
  | "date"
  | "array"
  | "object"
  | "boolean";

export type FnToDoc = { [fnName: string]: { doc?: DocMetadata } };

export type TargetNodeParameterContext = {
  nodeName: string;
  parameterPath: string;
};

export type AutocompleteInput<R = Resolved> = {
  resolved: R;
  base: string;
  tail: string;
  transformLabel?: (label: string) => string;
};
