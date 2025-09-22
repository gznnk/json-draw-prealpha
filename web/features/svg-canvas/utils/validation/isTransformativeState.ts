import type { TransformativeState } from "../../types/state/core/TransformativeState";

/**
 * Check if an object is TransformativeState.
 *
 * @param obj - The object to check
 * @returns True if the object is TransformativeState, false otherwise
 */
export const isTransformativeState = (
	obj: unknown,
): obj is TransformativeState => {
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
		"showTransformControls" in obj &&
		typeof (obj as TransformativeState).x === "number" &&
		typeof (obj as TransformativeState).y === "number" &&
		typeof (obj as TransformativeState).width === "number" &&
		typeof (obj as TransformativeState).height === "number" &&
		typeof (obj as TransformativeState).rotation === "number" &&
		typeof (obj as TransformativeState).scaleX === "number" &&
		typeof (obj as TransformativeState).scaleY === "number" &&
		typeof (obj as TransformativeState).keepProportion === "boolean" &&
		typeof (obj as TransformativeState).showTransformControls === "boolean"
	);
};
