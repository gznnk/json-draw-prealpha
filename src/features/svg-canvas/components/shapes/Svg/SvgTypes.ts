// Import types related to SvgCanvas.
import type { CreateDiagramProps } from "../../../types/props/CreateDiagramProps";
import type { SvgData } from "../../../types/data";

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
