import type { SelectableData } from "../../types/core";

/**
 * Check if an object is SelectableData.
 *
 * @param obj - The object to check
 * @returns True if the object is SelectableData, false otherwise
 */
export const isSelectableData = (obj: unknown): obj is SelectableData => {
	return (
		obj !== null &&
		typeof obj === "object" &&
		"isSelected" in obj &&
		"isMultiSelectSource" in obj &&
		typeof (obj as SelectableData).isSelected === "boolean" &&
		typeof (obj as SelectableData).isMultiSelectSource === "boolean"
	);
};
