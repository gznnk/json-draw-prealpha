// Import types related to SvgCanvas.
import type {
	CreateDiagramProps,
	CreateDiagramType,
} from "../../../types/DiagramTypes";

/**
 * Type of the WebSearchNode data.
 */
export type WebSearchNodeData = CreateDiagramType<{
	selectable: true;
	transformative: true;
	connectable: true;
}>;

/**
 * Type of the WebSearchNode component props.
 */
export type WebSearchNodeProps = CreateDiagramProps<
	WebSearchNodeData,
	{
		selectable: true;
		transformative: true;
		connectable: true;
		executable: true;
	}
>;
