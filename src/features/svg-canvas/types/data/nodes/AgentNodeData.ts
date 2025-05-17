// Import types related to SvgCanvas.
import type { CreateDataType } from "../shapes/CreateDataType";

/**
 * Type of the AgentNode data.
 */
export type AgentNodeData = CreateDataType<{
	selectable: true;
	transformative: true;
	connectable: true;
}>;
