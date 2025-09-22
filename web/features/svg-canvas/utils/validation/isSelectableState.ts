import type { SelectableState } from "../../types/state/core/SelectableState";

/**
 * Check if an object is SelectableState.
 *
 * @param obj - The object to check
 * @returns True if the object is SelectableState, false otherwise
 */
export const isSelectableState = (obj: unknown): obj is SelectableState => {
	return (
		obj !== null &&
		typeof obj === "object" &&
		"isSelected" in obj &&
		typeof (obj as SelectableState).isSelected === "boolean" &&
		"showOutline" in obj &&
		typeof (obj as SelectableState).showOutline === "boolean"
	);
};
