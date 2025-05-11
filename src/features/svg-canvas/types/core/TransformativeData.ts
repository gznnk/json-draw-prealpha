// Import base types.
import type { Shape } from "../base";

/**
 * Interface for diagram elements that can be resized, rotated, and repositioned.
 * Extends the Shape interface with additional transformation properties.
 */
export type TransformativeData = Shape & {
	keepProportion: boolean;
};
