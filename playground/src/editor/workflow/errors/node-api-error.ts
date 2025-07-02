import type { ErrorLevel } from "./types";
import type {
  Functionality,
} from "@/editor/types";

export interface NodeOperationErrorOptions {
  message?: string;
  description?: string;
  runIndex?: number;
  itemIndex?: number;
  level?: ErrorLevel;
  messageMapping?: { [key: string]: string }; // allows to pass custom mapping for error messages scoped to a node
  functionality?: Functionality;
  type?: string;
  metadata?: {
    subExecution?: unknown;
    parentExecution?: unknown;
  };
}
