// Import types related to SvgCanvas.
import type {
	CreateDiagramProps,
} from "../../../types/DiagramTypes";
import type { ImageData } from "../../../types/shape";

// Re-export from central type definitions
export type { ImageData } from "../../../types/shape";

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
