// Import types related to SvgCanvas.
import type { CreateDiagramProps } from "../../../types/DiagramTypes";
import type { SvgData } from "../../../types/shapes";

/**
 * Props for the Svg component.
 */
export type SvgProps = CreateDiagramProps<
	SvgData,
	{
		selectable: true;
		transformative: true;
	}
>;
