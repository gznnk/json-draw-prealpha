// Import types related to SvgCanvas.
import type { CreateDataType } from "../shapes/CreateDataType";

/**
 * Type of the SvgToDiagramNode data.
 */
export type SvgToDiagramNodeData = CreateDataType<{
	selectable: true;
	transformative: true;
	connectable: true;
}>;
