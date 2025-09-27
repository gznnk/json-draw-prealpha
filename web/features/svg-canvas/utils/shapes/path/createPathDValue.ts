import { createBezierDValue } from "./createBezierDValue";
import { createDValue } from "./createDValue";
import { createRoundedDValue } from "./createRoundedDValue";
import type { PathType } from "../../../types/core/PathType";
import type { Diagram } from "../../../types/state/core/Diagram";

/**
 * Creates a path data value (d attribute) from an array of diagram items based on PathType.
 *
 * @param items - Array of diagram items to create path from
 * @param pathType - Type of path to generate (Linear, Bezier, or Rounded)
 * @param radius - Corner radius for Rounded paths (default: 10)
 * @returns SVG path d attribute value
 */
export const createPathDValue = (
	items: Diagram[],
	pathType: PathType,
	radius: number = 10,
): string => {
	switch (pathType) {
		case "Bezier":
			return createBezierDValue(items);
		case "Rounded":
			return createRoundedDValue(items, radius);
		default:
			return createDValue(items);
	}
};
