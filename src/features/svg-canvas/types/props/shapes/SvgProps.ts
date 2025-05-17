// Import types related to SvgCanvas.
import type { CreateDiagramProps } from "../core/CreateDiagramProps";
import type { SvgData } from "../../data/shapes/SvgData";

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
