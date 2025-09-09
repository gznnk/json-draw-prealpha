// Import types.
import type { ItemableState } from "../../types/state/core/ItemableState";

/**
 * Check if an object is ItemableState.
 *
 * @param obj - The object to check
 * @returns True if the object is ItemableState, false otherwise
 */
export const isItemableState = <T = unknown>(
	obj: unknown,
): obj is ItemableState<T> => {
	return (
		obj !== null &&
		typeof obj === "object" &&
		"itemableType" in obj &&
		"items" in obj &&
		Array.isArray((obj as ItemableState<T>).items)
	);
};
