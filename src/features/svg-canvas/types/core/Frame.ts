// Import types.
import type { Point } from "./Point";

/**
 * Defines the geometric properties of a frame.
 * Includes position, dimensions, rotation, and scaling factors.
 */
export type Frame = Point & {
	width: number;
	height: number;
	rotation: number;
	scaleX: number;
	scaleY: number;
};