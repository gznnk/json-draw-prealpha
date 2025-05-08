// Import types related to SvgCanvas.
import type {
	CreateDiagramProps,
	CreateDiagramType,
} from "../../../types/DiagramTypes";

/**
 * Type of the AgentNode data.
 */
export type AgentNodeData = CreateDiagramType<{
	selectable: true;
	transformative: true;
	connectable: true;
}>;

/**
 * Type of the AgentNode component props.
 */
export type AgentNodeProps = CreateDiagramProps<
	AgentNodeData,
	{
		selectable: true;
		transformative: true;
		connectable: true;
		executable: true;
		itemCreatable: true;
	}
>;
