// Import types related to SvgCanvas.
import type { CreateDataType } from "../shapes/CreateDataType";

/**
 * Type of the VectorStoreNode data.
 */
export type VectorStoreNodeData = CreateDataType<{
	selectable: true;
	transformative: true;
	connectable: true;
}>;
