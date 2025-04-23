// Import types related to SvgCanvas.
import type {
	CreateDiagramProps,
	CreateDiagramType,
} from "../../../types/DiagramTypes";

/**
 * Type of the hub node data.
 */
export type HubNodeData = CreateDiagramType<{
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
