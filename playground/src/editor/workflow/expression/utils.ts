import { ExpressionError } from "../errors";
import { ResolvableState } from "./types";

const unsafeObjectProperties = new Set([
  "__proto__",
  "prototype",
  "constructor",
  "getPrototypeOf",
]);

/**
 * Checks if a property key is safe to use on an object, preventing prototype pollution.
 * setting untrusted properties can alter the object's prototype chain and introduce vulnerabilities.
 *
 * @see setSafeObjectProperty
 */
export function isSafeObjectProperty(property: string) {
  return !unsafeObjectProperties.has(property);
}

export const isNoExecDataExpressionError = (error: unknown): error is ExpressionError => {
	return error instanceof ExpressionError && error.context.type === 'no_execution_data';
};

export const isNoNodeExecDataExpressionError = (error: unknown): error is ExpressionError => {
	return error instanceof ExpressionError && error.context.type === 'no_node_execution_data';
};

export const isNoInputConnectionError = (error: unknown): error is ExpressionError => {
	return error instanceof ExpressionError && error.context.type === 'no_input_connection';
};

export const isAnyPairedItemError = (error: unknown): error is ExpressionError => {
	return error instanceof ExpressionError && error.functionality === 'pairedItem';
};

export const isPairedItemIntermediateNodesError = (
  error: unknown
): error is ExpressionError => {
  return (
    error instanceof ExpressionError &&
    error.context.type === "paired_item_intermediate_nodes"
  );
};

export const isPairedItemNoConnectionError = (error: unknown): error is ExpressionError => {
	return error instanceof ExpressionError && error.context.type === 'paired_item_no_connection';
};

export const isInvalidPairedItemError = (error: unknown): error is ExpressionError => {
	return error instanceof ExpressionError && error.context.type === 'paired_item_invalid_info';
};

export const isNoPairedItemError = (error: unknown): error is ExpressionError => {
	return error instanceof ExpressionError && error.context.type === 'paired_item_no_info';
};

export const getResolvableState = (error: unknown, ignoreError = false): ResolvableState => {
	if (!error) return 'valid';

	if (
		isNoExecDataExpressionError(error) ||
		isNoNodeExecDataExpressionError(error) ||
		isPairedItemIntermediateNodesError(error) ||
		ignoreError
	) {
		return 'pending';
	}

	return 'invalid';
};

export const getExpressionErrorMessage = (error: Error, nodeHasRunData = false): string => {
	if (isNoExecDataExpressionError(error) || isPairedItemIntermediateNodesError(error)) {
		return 'expressionModalInput.noExecutionData';
	}

	if (isNoNodeExecDataExpressionError(error)) {
		const nodeCause = error.context.nodeCause as string;
		return 'expressionModalInput.noNodeExecutionData' + nodeCause
	}

	if (isNoInputConnectionError(error)) {
		return 'expressionModalInput.noInputConnection';
	}

	if (isPairedItemNoConnectionError(error)) {
		return 'expressionModalInput.pairedItemConnectionError';
	}

	if (isInvalidPairedItemError(error) || isNoPairedItemError(error)) {
		const nodeCause = error.context.nodeCause as string;
		// const isPinned = !!useWorkflowsStore().pinDataByNodeName(nodeCause);
		const isPinned = false

		if (isPinned) {
			return 'expressionModalInput.pairedItemInvalidPinnedError' + nodeCause
		}
	}

	if (isAnyPairedItemError(error)) {
		return nodeHasRunData
			? 'expressionModalInput.pairedItemError'
			: 'expressionModalInput.pairedItemError.noRunData';
	}

	return error.message;
};