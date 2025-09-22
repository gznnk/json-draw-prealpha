import type { FillableState } from "../../types/state/core/FillableState";

/**
 * Check if an object is FillableState.
 *
 * @param obj - The object to check
 * @returns True if the object is FillableState, false otherwise
 */
export const isFillableState = (obj: unknown): obj is FillableState => {
	return (
		obj !== null &&
		typeof obj === "object" &&
		"fill" in obj &&
		typeof (obj as FillableState).fill === "string"
	);
};
