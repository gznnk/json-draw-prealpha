// Import types related to SvgCanvas.
import type { CreateDataType } from "../shapes/CreateDataType";

/**
 * Type of the WebSearchNode data.
 */
export type WebSearchNodeData = CreateDataType<{
	selectable: true;
	transformative: true;
	connectable: true;
}>;
