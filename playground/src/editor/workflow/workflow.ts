import {
    NodeConnectionTypes,
    type IConnections,
    type INode,
    type INodeConnection,
    type INodeExecutionData,
    type INodes,
    type INodeUi,
    type IPinData, type IWorkflowSettings,
    type NodeConnectionType
} from "@/editor/types";
import { Expression } from "../workflow/expression";

export class Workflow {
  public nodes: INodes = {};
  public settings: IWorkflowSettings;
  public pinData?: IPinData;
  public expression: Expression;
  public connectionsByDestinationNode: IConnections;

  constructor() {
    this.nodes = {
      "InputNode": {
        id: "1",
        name: "InputNode",
        typeVersion: 1,
        type: "TypeA",
        position: [100, 200],
        parameters: {},
      },
      "ActiveNode": {
        id: "2",
        name: "ActiveNode",
        typeVersion: 1,
        type: "TypeB",
        position: [300, 400],
        parameters: {},
      },
      "OutputNode": {
        id: "3",
        name: "OutputNode",
        typeVersion: 1,
        type: "TypeC",
        position: [500, 600],
        parameters: {},
      },
    };

    this.settings = {
      timezone: "UTC",
    };

    this.pinData = {};

    this.expression = new Expression(this);

    // Save also the connections by the destination nodes
    this.connectionsByDestinationNode = {};
  }

  public getChildNodes(
    _nodeName: string,
    _type?: NodeConnectionType | "ALL" | "ALL_NON_MAIN",
    _depth?: number
  ): string[] {

    return [];
  }

  public getParentNodesByDepth(_nodeName: string): INodeUi[] {
    return [
     
    ];
  }

  public getParentNodes(_nodeName: string): string[] {
    return [];
  }

  public getParentMainInputNode(_node: INode): INode {
    return {
      id: "1",
      name: "InputNode",
      typeVersion: 1,
      type: "TypeA",
      position: [100, 200],
      parameters: {},
    };
  }

  getPinDataOfNode(nodeName: string): INodeExecutionData[] | undefined {
    return this.pinData ? this.pinData[nodeName] : undefined;
  }

  /**
   * Returns the node with the given name if it exists else null
   *
   * @param {string} nodeName Name of the node to return
   */
  getNode(nodeName: string): INode | null {
    return Object.prototype.hasOwnProperty.call(this.nodes, nodeName)
      ? this.nodes[nodeName]
      : null;
  }

  /**
   * Returns via which output of the parent-node and index the current node
   * they are connected
   *
   * @param {string} nodeName The node to check how it is connected with parent node
   * @param {string} parentNodeName The parent node to get the output index of
   * @param {string} [type='main']
   * @param {*} [depth=-1]
   */
  getNodeConnectionIndexes(
    nodeName: string,
    parentNodeName: string,
    type: NodeConnectionType = NodeConnectionTypes.Main,
    depth = -1,
    checkedNodes?: string[]
  ): INodeConnection | undefined {
    const node = this.getNode(parentNodeName);
    if (node === null) {
      return undefined;
    }

    depth = depth === -1 ? -1 : depth;
    const newDepth = depth === -1 ? depth : depth - 1;
    if (depth === 0) {
      // Reached max depth
      return undefined;
    }

    if (!this.connectionsByDestinationNode.hasOwnProperty(nodeName)) {
      // Node does not have incoming connections
      return undefined;
    }

    if (!this.connectionsByDestinationNode[nodeName].hasOwnProperty(type)) {
      // Node does not have incoming connections of given type
      return undefined;
    }

    checkedNodes = checkedNodes || [];

    if (checkedNodes.includes(nodeName)) {
      // Node got checked already before
      return undefined;
    }

    checkedNodes.push(nodeName);

    let outputIndex: INodeConnection | undefined;
    for (const connectionsByIndex of this.connectionsByDestinationNode[
      nodeName
    ][type]) {
      if (!connectionsByIndex) {
        continue;
      }

      for (
        let destinationIndex = 0;
        destinationIndex < connectionsByIndex.length;
        destinationIndex++
      ) {
        const connection = connectionsByIndex[destinationIndex];
        if (parentNodeName === connection.node) {
          return {
            sourceIndex: connection.index,
            destinationIndex,
          };
        }

        if (checkedNodes.includes(connection.node)) {
          // Node got checked already before so continue with the next one
          continue;
        }

        outputIndex = this.getNodeConnectionIndexes(
          connection.node,
          parentNodeName,
          type,
          newDepth,
          checkedNodes
        );

        if (outputIndex !== undefined) {
          return outputIndex;
        }
      }
    }

    return undefined;
  }
}
