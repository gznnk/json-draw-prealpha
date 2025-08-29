// Import types.
import type { DiagramFeatures } from "../../core/DiagramFeatures";
import type { Frame } from "../../core/Frame";
import type { CreateDataType } from "../shapes/CreateDataType";

/**
 * Diagram features for Frame elements.
 */
export const FrameFeatures = {
	transformative: true,
	connectable: true,
	strokable: true,
	fillable: true,
	cornerRoundable: true,
	textable: false,
	selectable: true,
	fileDroppable: false,
} as const satisfies DiagramFeatures;

/**
 * Data type for frame elements.
 * Contains properties specific to frame diagram elements.
 */
export type FrameData = CreateDataType<typeof FrameFeatures> & Frame;