// Import types related to SvgCanvas.
import type {
	CreateDiagramProps,
} from "../../../types/DiagramTypes";
import type { RectangleData } from "../../../types/shape";

// Re-export from central type definitions
export type { RectangleData } from "../../../types/shape";

/**
 * 四角形コンポーネントのプロパティ
 */
export type RectangleProps = CreateDiagramProps<
	RectangleData,
	{
		selectable: true;
		transformative: true;
		connectable: true;
		textable: true;
		fileDroppable: true;
	}
>;
