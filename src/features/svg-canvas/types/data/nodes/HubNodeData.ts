// Import types related to SvgCanvas.
import type { CreateDataType } from "../shapes/CreateDataType";

/**
 * Type of the hub node data.
 */
export type HubNodeData = CreateDataType<{
	selectable: true;
	transformative: true;
	connectable: true;
}>;
