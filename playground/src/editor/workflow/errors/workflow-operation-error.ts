import type { INode } from "@/editor/types";
import { ExecutionBaseError } from "./execution-base-error";

/**
 * Class for instantiating an operational error, e.g. a timeout error.
 */
export class WorkflowOperationError extends ExecutionBaseError {
  node: INode | undefined;

  timestamp: number;

  constructor(message: string, node?: INode, description?: string) {
    super(message, { cause: undefined });
    this.level = "warning";
    this.name = this.constructor.name;
    if (description) this.description = description;
    this.node = node;
    this.timestamp = Date.now();
  }
}
