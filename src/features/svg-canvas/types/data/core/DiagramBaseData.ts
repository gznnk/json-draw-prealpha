// Import base types.
import type { DiagramType } from "../../base/DiagramType";

/**
 * Base data structure for all diagram elements.
 * Provides common properties that all diagram types must implement.
 */
export type DiagramBaseData = {
	id: string;
	type: DiagramType;
	x: number;
	y: number;
	isDragging?: boolean;
};
