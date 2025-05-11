// Import types.
import type { Shape } from "../../types";

/**
 * Check if an object is a Shape.
 *
 * @param obj - The object to check
 * @returns True if the object is a Shape, false otherwise
 */
export const isShape = (obj: unknown): obj is Shape => {
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
		typeof (obj as Shape).x === "number" &&
		typeof (obj as Shape).y === "number" &&
		typeof (obj as Shape).width === "number" &&
		typeof (obj as Shape).height === "number" &&
		typeof (obj as Shape).rotation === "number" &&
		typeof (obj as Shape).scaleX === "number" &&
		typeof (obj as Shape).scaleY === "number"
	);
};
