// Import types.
import type { FillableData } from "../../types";

/**
 * Check if an object is FillableData.
 *
 * @param obj - The object to check
 * @returns True if the object is FillableData, false otherwise
 */
export const isFillableData = (obj: unknown): obj is FillableData => {
	return (
		obj !== null &&
		typeof obj === "object" &&
		"fill" in obj &&
		typeof (obj as FillableData).fill === "string"
	);
};
