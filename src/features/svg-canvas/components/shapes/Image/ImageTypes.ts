// Import types related to SvgCanvas.
import type { CreateDiagramProps } from "../../../types/props/CreateDiagramProps";
import type { ImageData } from "../../../types/data";

/**
 * Props for the Image component.
 */
export type ImageProps = CreateDiagramProps<
	ImageData,
	{
		selectable: true;
		transformative: true;
	}
>;
