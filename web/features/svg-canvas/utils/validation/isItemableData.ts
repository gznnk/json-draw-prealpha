import type { ItemableData } from "../../types/data/core/ItemableData";

/**
 * Check if an object is ItemableData.
 *
 * @param obj - The object to check
 * @returns True if the object is ItemableData, false otherwise
 */
export const isItemableData = (obj: unknown): obj is ItemableData => {
	return (
		obj !== null &&
		typeof obj === "object" &&
		"items" in obj &&
		Array.isArray((obj as ItemableData).items)
	);
};
