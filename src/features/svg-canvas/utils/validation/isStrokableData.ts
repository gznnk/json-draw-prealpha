// Import types.
import type { StrokableData } from "../../types";

/**
 * Check if an object is StrokableData.
 *
 * @param obj - The object to check
 * @returns True if the object is StrokableData, false otherwise
 */
export const isStrokableData = (obj: unknown): obj is StrokableData => {
	return (
		obj !== null &&
		typeof obj === "object" &&
		"stroke" in obj &&
		"strokeWidth" in obj &&
		typeof (obj as StrokableData).stroke === "string" &&
		typeof (obj as StrokableData).strokeWidth === "string"
	);
};
