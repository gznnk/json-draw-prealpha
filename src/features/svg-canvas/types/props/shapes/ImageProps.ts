// Import types related to SvgCanvas.
import type { CreateDiagramProps } from "../core/CreateDiagramProps";
import type { ImageData } from "../../data/shapes/ImageData";

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
