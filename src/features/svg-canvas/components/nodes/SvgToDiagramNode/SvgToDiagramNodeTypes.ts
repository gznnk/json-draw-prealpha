// Import types related to SvgCanvas.
import type { CreateDiagramProps } from "../../../types/props/CreateDiagramProps";
import type { CreateDataType } from "../../../types/data";

/**
 * Type of the SvgToDiagramNode data.
 */
export type SvgToDiagramNodeData = CreateDataType<{
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
