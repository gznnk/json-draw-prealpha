// Import types.
import type { ConnectableState } from "../../types/diagrams/shapes/ConnectableTypes";

/**
 * Check if an object is ConnectableState.
 *
 * @param obj - The object to check
 * @returns True if the object is ConnectableState, false otherwise
 */
export const isConnectableState = (obj: unknown): obj is ConnectableState => {
	return (
		obj !== null &&
		typeof obj === "object" &&
		"showConnectPoints" in obj &&
		typeof (obj as ConnectableState).showConnectPoints === "boolean" &&
		"connectPoints" in obj &&
		Array.isArray((obj as ConnectableState).connectPoints)
	);
};
