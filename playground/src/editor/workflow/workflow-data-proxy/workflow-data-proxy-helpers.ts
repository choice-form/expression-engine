import type {
  INodeExecutionData,
  WorkflowExecuteMode,
} from "@/editor/types";
import type { Workflow } from "../workflow";

export function getPinDataIfManualExecution(
  workflow: Workflow,
  nodeName: string,
  mode: WorkflowExecuteMode
): INodeExecutionData[] | undefined {
  if (mode !== "manual") {
    return undefined;
  }
  return workflow.getPinDataOfNode(nodeName);
}
