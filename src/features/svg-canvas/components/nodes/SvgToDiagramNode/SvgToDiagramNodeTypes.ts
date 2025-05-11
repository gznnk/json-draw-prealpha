// Import types related to SvgCanvas.
import type { CreateDiagramProps } from "../../../types/DiagramTypes";
import type { CreateDiagramType } from "../../../types/shapes";

/**
 * Type of the SvgToDiagramNode data.
 */
export type SvgToDiagramNodeData = CreateDiagramType<{
	selectable: true;
	transformative: true;
	connectable: true;
}>;

/**
 * Type of the SvgToDiagramNode component props.
 */
export type SvgToDiagramNodeProps = CreateDiagramProps<
	SvgToDiagramNodeData,
	{
		selectable: true;
		transformative: true;
		connectable: true;
		executable: true;
	}
>;
