// Import types related to SvgCanvas.
import type { CreateDiagramProps } from "../../../types/props/CreateDiagramProps";
import type { CreateDataType } from "../../../types/data";

/**
 * Type of the hub node data.
 */
export type HubNodeData = CreateDataType<{
	selectable: true;
	transformative: true;
	connectable: true;
}>;

/**
 * Type of the hub node component props.
 */
export type HubNodeProps = CreateDiagramProps<
	HubNodeData,
	{
		selectable: true;
		transformative: true;
		connectable: true;
		executable: true;
	}
>;
