// Import types related to SvgCanvas.
import type { CreateDiagramProps } from "../../../types/props/CreateDiagramProps";
import type { CreateDataType } from "../../../types/data";

/**
 * Type of the WebSearchNode data.
 */
export type WebSearchNodeData = CreateDataType<{
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
