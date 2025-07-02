import type { INodeParameterResourceLocator } from "@/editor/types";

export function isResourceLocatorValue(value: unknown): value is INodeParameterResourceLocator {
	return Boolean(
		typeof value === 'object' && value && 'mode' in value && 'value' in value && '__rl' in value,
	);
}
