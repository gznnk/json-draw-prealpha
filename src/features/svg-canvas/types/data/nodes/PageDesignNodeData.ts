// Import types related to SvgCanvas.
import type { CreateDataType } from "../shapes/CreateDataType";

/**
 * Type of the PageDesignNode data.
 */
export type PageDesignNodeData = CreateDataType<{
	selectable: true;
	transformative: true;
	connectable: true;
}>;
