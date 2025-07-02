import type { TargetItem } from "@/editor/types";
import { getWorkflowsStore } from "./use-workflows-store";

export function getNodeDataStore() {
  const activeNodeName = "ActiveNode";

  const workflowsStore = getWorkflowsStore();
  const activeNode = workflowsStore.getNodeByName(activeNodeName || "");

  const targetItem: TargetItem = {
    nodeName: activeNodeName,
    itemIndex: 0,
    runIndex: 0,
    outputIndex: 0,
  };

  return {
    activeNode,
    expressionTargetItem: targetItem,
    isInputParentOfActiveNode: true, // 当前输入节点是否是激活节点的直接父节点
    inputNodeName: "InputNode",
  };
}
