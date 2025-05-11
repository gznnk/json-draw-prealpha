// Import types.
import type { TransformativeData } from "../../types";

/**
 * Check if an object is TransformativeData.
 *
 * @param obj - The object to check
 * @returns True if the object is TransformativeData, false otherwise
 */
export const isTransformativeData = (
	obj: unknown,
): obj is TransformativeData => {
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
		"keepProportion" in obj &&
		typeof (obj as TransformativeData).x === "number" &&
		typeof (obj as TransformativeData).y === "number" &&
		typeof (obj as TransformativeData).width === "number" &&
		typeof (obj as TransformativeData).height === "number" &&
		typeof (obj as TransformativeData).rotation === "number" &&
		typeof (obj as TransformativeData).scaleX === "number" &&
		typeof (obj as TransformativeData).scaleY === "number" &&
		typeof (obj as TransformativeData).keepProportion === "boolean"
	);
};
