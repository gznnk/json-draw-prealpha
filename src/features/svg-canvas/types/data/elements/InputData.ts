// Import types.
import type { DiagramFeatures } from "../../core/DiagramFeatures";
import type { CreateDataType } from "../shapes/CreateDataType";
import type { Frame } from "../../core/Frame";

/**
 * Diagram features for Input shapes.
 */
export const InputFeatures = {
	transformative: false,
	connectable: false,
	strokable: false,
	fillable: false,
	cornerRoundable: false,
	textable: true,
	selectable: false,
	fileDroppable: false,
} as const satisfies DiagramFeatures;

/**
 * Data type for Input shapes.
 * Contains properties specific to Input diagram elements.
 */
export type InputData = CreateDataType<typeof InputFeatures> & Frame;