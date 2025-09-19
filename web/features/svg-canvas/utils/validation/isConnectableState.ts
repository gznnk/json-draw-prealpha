import type { ConnectableState } from "../../types/state/shapes/ConnectableState";

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
		"connectEnabled" in obj &&
		typeof (obj as ConnectableState).connectEnabled === "boolean" &&
		"connectPoints" in obj &&
		Array.isArray((obj as ConnectableState).connectPoints)
	);
};
