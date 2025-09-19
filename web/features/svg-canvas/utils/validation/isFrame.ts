import type { Frame } from "../../types/core/Frame";

/**
 * Check if an object is a Frame.
 *
 * @param obj - The object to check
 * @returns True if the object is a Frame, false otherwise
 */
export const isFrame = (obj: unknown): obj is Frame => {
	return (
		obj !== null &&
		typeof obj === "object" &&
		"x" in obj &&
		"y" in obj &&
		"width" in obj &&
		"height" in obj &&
		"rotation" in obj &&
		"scaleX" in obj &&
		"scaleY" in obj &&
		typeof (obj as Frame).x === "number" &&
		typeof (obj as Frame).y === "number" &&
		typeof (obj as Frame).width === "number" &&
		typeof (obj as Frame).height === "number" &&
		typeof (obj as Frame).rotation === "number" &&
		typeof (obj as Frame).scaleX === "number" &&
		typeof (obj as Frame).scaleY === "number"
	);
};
