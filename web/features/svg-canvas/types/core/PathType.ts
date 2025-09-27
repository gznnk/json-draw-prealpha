/**
 * Path type definitions for different path rendering modes.
 *
 * - Linear: Straight lines between path points
 * - Bezier: Quadratic Bézier curves using path points as control points
 * - Rounded: Straight lines with rounded corners between path points
 */
export type PathType = "Linear" | "Bezier" | "Rounded";
