import type { Bounds } from "./Bounds";
import type { Prettify } from "../../../../shared/utility-types";

/**
 * Defines the geometric properties of a frame.
 * Includes position, dimensions, rotation, and scaling factors.
 */
export type Frame = Prettify<
	Bounds & {
		rotation: number;
		scaleX: number;
		scaleY: number;
	}
>;
