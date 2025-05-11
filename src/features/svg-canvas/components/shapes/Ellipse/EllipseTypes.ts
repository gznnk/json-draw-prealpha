// Import types related to SvgCanvas.
import type {
	CreateDiagramProps,
} from "../../../types/DiagramTypes";
import type { EllipseData } from "../../../types/shape";

// Re-export from central type definitions
export type { EllipseData } from "../../../types/shape";

/**
 * 楕円コンポーネントのプロパティ
 */
export type EllipseProps = CreateDiagramProps<
	EllipseData,
	{
		selectable: true;
		transformative: true;
		connectable: true;
		textable: true;
	}
>;
