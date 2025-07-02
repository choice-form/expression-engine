import type { DocMetadata } from "@/editor/types";

export interface ExtensionMap {
  typeName: string;
  functions: Record<string, Extension>;
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export type Extension = Function & { doc?: DocMetadata };
