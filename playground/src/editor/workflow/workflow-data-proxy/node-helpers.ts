import type { IContextObject, INode, IRunExecutionData } from "@/editor/types";
import { ApplicationError } from "../errors";

/**
 * Returns the context data
 *
 * @param {IRunExecutionData} runExecutionData The run execution data
 * @param {string} type The data type. "node"/"flow"
 * @param {INode} [node] If type "node" is set the node to return the context of has to be supplied
 */
export function getContext(
	runExecutionData: IRunExecutionData,
	type: string,
	node?: INode,
): IContextObject {
	if (runExecutionData.executionData === undefined) {
		// TODO: Should not happen leave it for test now
		throw new ApplicationError('`executionData` is not initialized');
	}

	let key: string;
	if (type === 'flow') {
		key = 'flow';
	} else if (type === 'node') {
		if (node === undefined) {
			// @TODO: What does this mean?
			throw new ApplicationError(
				'The request data of context type "node" the node parameter has to be set!',
			);
		}
		key = `node:${node.name}`;
	} else {
		throw new ApplicationError('Unknown context type. Only `flow` and `node` are supported.', {
			extra: { contextType: type },
		});
	}

	if (runExecutionData.executionData.contextData[key] === undefined) {
		runExecutionData.executionData.contextData[key] = {};
	}

	return runExecutionData.executionData.contextData[key];
}
