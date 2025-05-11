// Import types related to SvgCanvas.
import type {
	CreateDiagramProps,
} from "../../../types/DiagramTypes";
import type { SvgData } from "../../../types/shape";

// Re-export from central type definitions
export type { SvgData } from "../../../types/shape";

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
