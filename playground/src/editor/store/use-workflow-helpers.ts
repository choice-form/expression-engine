import { PLACEHOLDER_FILLED_AT_EXECUTION_TIME } from "@/editor/extensions/constants";
import {
  NodeConnectionTypes,
  type IDataObject,
  type IExecuteData,
  type INodeConnection,
  type INodeExecutionData,
  type INodeParameters,
  type IRunExecutionData,
  type IWorkflowDataProxyAdditionalKeys,
  type NodeParameterValue,
  type TargetItem,
} from "@/editor/types";
import { getNodeDataStore } from "./use-node-data-store";
import { getWorkflowsStore } from "./use-workflows-store";
import get from "lodash/get";
import { Workflow } from "../workflow";

export type ResolveParameterOptions = {
  targetItem?: TargetItem;
  inputNodeName?: string;
  inputRunIndex?: number;
  inputBranchIndex?: number;
  additionalKeys?: IDataObject;
  isForCredential?: boolean;
  contextNodeName?: string;
};

//#region Utils

function getCurrentWorkflow(): Workflow {
  return new Workflow();
}

export function resolveParameter<T = IDataObject>(
	parameter: NodeParameterValue | INodeParameters | NodeParameterValue[] | INodeParameters[],
	opts: ResolveParameterOptions = {},
): T | null {
	const itemIndex = opts?.targetItem?.itemIndex || 0;

	const workflow = getCurrentWorkflow();

	const additionalKeys: IWorkflowDataProxyAdditionalKeys = {
		$execution: {
			id: PLACEHOLDER_FILLED_AT_EXECUTION_TIME,
			mode: 'test',
			resumeUrl: PLACEHOLDER_FILLED_AT_EXECUTION_TIME,
			resumeFormUrl: PLACEHOLDER_FILLED_AT_EXECUTION_TIME,
		},
		...opts.additionalKeys,
	};

	if (opts.isForCredential) {
		// node-less expression resolution
		return workflow.expression.getParameterValue(
			parameter,
			null,
			0,
			itemIndex,
			'',
			[],
			'manual',
			additionalKeys,
			undefined,
			false,
			undefined,
			'',
		) as T;
	}

	const inputName = NodeConnectionTypes.Main;

	const activeNode =
		getNodeDataStore().activeNode ?? getWorkflowsStore().getNodeByName(opts.contextNodeName || '');
	let contextNode = activeNode;

	if (activeNode) {
		contextNode = workflow.getParentMainInputNode(activeNode);
	}
  
	const workflowRunData =  getWorkflowsStore().workflowRunData;
	let parentNode = workflow.getParentNodes(contextNode?.name ?? "");

	let runIndexParent = opts?.inputRunIndex ?? 0;
	const nodeConnection = workflow.getNodeConnectionIndexes(contextNode!.name, parentNode[0]);
  const executionData = getWorkflowsStore().workflowExecution;


  if (opts.targetItem && opts?.targetItem?.nodeName === contextNode!.name && executionData) {
		// const sourceItems = getSourceItems(executionData, opts.targetItem);
		// if (!sourceItems.length) {
		// 	return null;
		// }
		// parentNode = [sourceItems[0].nodeName];
		// runIndexParent = sourceItems[0].runIndex;
		// itemIndex = sourceItems[0].itemIndex;
		// if (nodeConnection) {
		// 	nodeConnection.sourceIndex = sourceItems[0].outputIndex;
		// }
	} else {
		parentNode = opts.inputNodeName ? [opts.inputNodeName] : parentNode;
		if (nodeConnection) {
			nodeConnection.sourceIndex = opts.inputBranchIndex ?? nodeConnection.sourceIndex;
		}

		if (opts?.inputRunIndex === undefined && workflowRunData !== null && parentNode.length) {
			const firstParentWithWorkflowRunData = parentNode.find(
				(parentNodeName) => workflowRunData[parentNodeName],
			);
			if (firstParentWithWorkflowRunData) {
				runIndexParent = workflowRunData[firstParentWithWorkflowRunData].length - 1;
			}
		}
	}


	let _connectionInputData = connectionInputData(
		parentNode,
		contextNode!.name,
		inputName,
		runIndexParent,
		nodeConnection,
	);

	if (_connectionInputData === null && contextNode && activeNode?.name !== contextNode.name) {
		// For Sub-Nodes connected to Trigger-Nodes use the data of the root-node
		// (Gets for example used by the Memory connected to the Chat-Trigger-Node)
		const _executeData = executeData([contextNode.name], contextNode.name, inputName, 0);
		_connectionInputData = get(_executeData, ['data', inputName, 0], null);
	}

	let runExecutionData: IRunExecutionData
	if (!executionData?.data) {
		runExecutionData = {
			resultData: {
				runData: {},
			},
		};
	} else {
		runExecutionData = executionData.data;
	}

	if (_connectionInputData === null) {
		_connectionInputData = [];
	}


  // TODO: Request 节点专用逻辑
	// if (activeNode?.type === HTTP_REQUEST_NODE_TYPE) {
	// 	const EMPTY_RESPONSE = { statusCode: 200, headers: {}, body: {} };
	// 	const EMPTY_REQUEST = { headers: {}, body: {}, qs: {} };
	// 	// Add $request,$response,$pageCount for HTTP Request-Nodes as it is used
	// 	// in pagination expressions
	// 	additionalKeys.$pageCount = 0;
	// 	additionalKeys.$response = get(
	// 		executionData,
	// 		['data', 'executionData', 'contextData', `node:${activeNode.name}`, 'response'],
	// 		EMPTY_RESPONSE,
	// 	);
	// 	additionalKeys.$request = EMPTY_REQUEST;
	// }

	let runIndexCurrent = opts?.targetItem?.runIndex ?? 0;
	if (
		opts?.targetItem === undefined &&
		workflowRunData !== null &&
		workflowRunData[contextNode!.name]
	) {
		runIndexCurrent = workflowRunData[contextNode!.name].length - 1;
	}
	let _executeData = executeData(
		parentNode,
		contextNode!.name,
		inputName,
		runIndexCurrent,
		runIndexParent,
	);

	if (!_executeData.source) {
		// fallback to parent's run index for multi-output case
		_executeData = executeData(parentNode, contextNode!.name, inputName, runIndexParent);
	}



  const result = workflow.expression.getParameterValue(
		parameter,
		runExecutionData,
		runIndexCurrent,
		itemIndex,
		activeNode!.name,
    	_connectionInputData,
		'manual',
		additionalKeys,
		_executeData,
		false,
		{},
		contextNode!.name,
	) as T;

	return  result
}

// Returns connectionInputData to be able to execute an expression.
function connectionInputData(
	parentNode: string[],
	currentNode: string,
	inputName: string,
	runIndex: number,
	nodeConnection: INodeConnection = { sourceIndex: 0, destinationIndex: 0 },
): INodeExecutionData[] | null {
	let connectionInputData: INodeExecutionData[] | null = null;
	const _executeData = executeData(parentNode, currentNode, inputName, runIndex);
	if (parentNode.length) {
		if (
			!Object.keys(_executeData.data).length ||
			_executeData.data[inputName].length <= nodeConnection.sourceIndex
		) {
			connectionInputData = [];
		} else {
			connectionInputData = _executeData.data[inputName][nodeConnection.sourceIndex];

			if (connectionInputData !== null) {
				// Update the pairedItem information on items
				connectionInputData = connectionInputData.map((item, itemIndex) => {
					return {
						...item,
						pairedItem: {
							item: itemIndex,
							input: nodeConnection.destinationIndex,
						},
					};
				});
			}
		}
	}

	return connectionInputData;
}

export function executeData(
	parentNodes: string[],
	currentNode: string,
	inputName: string,
	runIndex: number,
	parentRunIndex?: number,
): IExecuteData {
	const executeData = {
		node: {},
		data: {},
		source: null,
	} as IExecuteData;

	parentRunIndex = parentRunIndex ?? runIndex;

	const workflowsStore = getWorkflowsStore();

	// Find the parent node which has data
	for (const parentNodeName of parentNodes) {
		// if (workflowsStore.shouldReplaceInputDataWithPinData) {
		// 	const parentPinData = workflowsStore.pinnedWorkflowData![parentNodeName];

		// 	// populate `executeData` from `pinData`

		// 	if (parentPinData) {
		// 		executeData.data = { main: [parentPinData] };
		// 		executeData.source = { main: [{ previousNode: parentNodeName }] };

		// 		return executeData;
		// 	}
		// }

		// populate `executeData` from `runData`
		const workflowRunData = workflowsStore.workflowRunData;

		if (workflowRunData === null) {
			return executeData;
		}

		if (
			!workflowRunData[parentNodeName] ||
			workflowRunData[parentNodeName].length <= parentRunIndex ||
			!workflowRunData[parentNodeName][parentRunIndex] ||
			!workflowRunData[parentNodeName][parentRunIndex].hasOwnProperty('data') ||
			workflowRunData[parentNodeName][parentRunIndex].data === undefined ||
			!workflowRunData[parentNodeName][parentRunIndex].data?.hasOwnProperty(inputName)
		) {
			executeData.data = {};
		} else {
			executeData.data = workflowRunData[parentNodeName][parentRunIndex].data!;
			if (workflowRunData[currentNode] && workflowRunData[currentNode][runIndex]) {
				executeData.source = {
					[inputName]: workflowRunData[currentNode][runIndex].source,
				};
			} else {
				const workflow = getCurrentWorkflow();

				let previousNodeOutput: number | undefined;
				// As the node can be connected through either of the outputs find the correct one
				// and set it to make pairedItem work on not executed nodes
				if (workflow.connectionsByDestinationNode[currentNode]?.main) {
					mainConnections: for (const mainConnections of workflow.connectionsByDestinationNode[
						currentNode
					].main) {
						for (const connection of mainConnections ?? []) {
							if (
								connection.type === NodeConnectionTypes.Main &&
								connection.node === parentNodeName
							) {
								previousNodeOutput = connection.index;
								break mainConnections;
							}
						}
					}
				}

				// The current node did not get executed in UI yet so build data manually
				executeData.source = {
					[inputName]: [
						{
							previousNode: parentNodeName,
							previousNodeOutput,
							previousNodeRun: parentRunIndex,
						},
					],
				};
			}
			return executeData;
		}
	}

	return executeData;
}

function resolveExpression(
	expression: string,
	siblingParameters: INodeParameters = {},
	opts: ResolveParameterOptions & { c?: number } = {},
	stringifyObject = true,
) {
	const parameters = {
		__xxxxxxx__: expression,
		...siblingParameters,
	};
	const returnData: IDataObject | null = resolveParameter(parameters, opts);
	if (!returnData) {
		return null;
	}

	const obj = returnData.__xxxxxxx__;
	if (typeof obj === 'object' && stringifyObject) {
		const proxy = obj as { isProxy: boolean; toJSON?: () => unknown } | null;
		if (proxy?.isProxy && proxy.toJSON) return JSON.stringify(proxy.toJSON());
		const workflow = getCurrentWorkflow();
		return workflow.expression.convertObjectValueToString(obj as object);
	}
	return obj;
}

//#endregion

export function getWorkflowHelpers() {
  return {
    getCurrentWorkflow,
	resolveExpression
  };
}
