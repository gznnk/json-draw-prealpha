import type { GroupState } from "../../types/state/shapes/GroupState";

/**
 * Check if an object is GroupState.
 *
 * @param obj - The object to check
 * @returns True if the object is GroupState, false otherwise
 */
export const isGroupState = (obj: unknown): obj is GroupState => {
	return (
		obj !== null &&
		typeof obj === "object" &&
		"type" in obj &&
		(obj as GroupState).type === "Group" &&
		"items" in obj &&
		Array.isArray((obj as GroupState).items)
	);
};
