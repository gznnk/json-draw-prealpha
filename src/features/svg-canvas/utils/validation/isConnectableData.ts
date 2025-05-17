// Import types.
import type { ConnectableData } from "../../types/data/shapes/ConnectableData";

/**
 * Check if an object is ConnectableData.
 *
 * @param obj - The object to check
 * @returns True if the object is ConnectableData, false otherwise
 */
export const isConnectableData = (obj: unknown): obj is ConnectableData => {
	return (
		obj !== null &&
		typeof obj === "object" &&
		"connectPoints" in obj &&
		Array.isArray((obj as ConnectableData).connectPoints)
	);
};
