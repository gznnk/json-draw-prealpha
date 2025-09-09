import type { Point } from "../../types/core/Point";

/**
 * Type guard to check if a value is a valid Point object.
 * Validates that the value has x and y properties that are both numbers.
 */
export const isPoint = (value: unknown): value is Point => {
	return (
		typeof value === "object" &&
		value !== null &&
		"x" in value &&
		"y" in value &&
		typeof (value as Point).x === "number" &&
		typeof (value as Point).y === "number"
	);
};
