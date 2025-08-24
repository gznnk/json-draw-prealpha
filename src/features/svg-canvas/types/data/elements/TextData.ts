// Import types.
import type { DiagramFeatures } from "../../core/DiagramFeatures";
import type { Shape } from "../../core/Shape";
import type { CreateDataType } from "../shapes/CreateDataType";

/**
 * Diagram features for Text shapes.
 */
export const TextFeatures = {
	transformative: false,
	connectable: false,
	strokable: false,
	fillable: false,
	textable: true,
	selectable: true,
	fileDroppable: false,
} as const satisfies DiagramFeatures;

/**
 * Data type for text shapes.
 * Contains properties specific to text diagram elements.
 */
export type TextData = CreateDataType<typeof TextFeatures> & Shape;
