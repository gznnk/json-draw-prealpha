// Import types related to SvgCanvas.
import type { CreateDataType } from "../shapes/CreateDataType";

/**
 * Type of the ImageGenNode data.
 */
export type ImageGenNodeData = CreateDataType<{
	selectable: true;
	transformative: true;
	connectable: true;
}>;
