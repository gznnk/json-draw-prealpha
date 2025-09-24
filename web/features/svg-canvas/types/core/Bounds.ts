import type { Dimensions } from "./Dimensions";
import type { Point } from "./Point";
import type { Prettify } from "../../../../shared/utility-types";

/**
 * Defines the rectangular bounds of a diagram element.
 * Used to determine the position and dimensions of diagram elements on the canvas.
 */
export type Bounds = Prettify<Point & Dimensions>;
