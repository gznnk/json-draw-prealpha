// Import types related to SvgCanvas.
import type {
	CreateDiagramType,
	CreateDiagramProps,
} from "../../../types/DiagramTypes";

/**
 * Type for the data of the Image component.
 */
export type ImageData = CreateDiagramType<{
	selectable: true;
	transformative: true;
}> & {
	base64Data: string;
};

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
