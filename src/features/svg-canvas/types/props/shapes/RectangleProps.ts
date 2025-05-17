// Import types.
import type { CreateDiagramProps } from "../core/CreateDiagramProps";
import type { RectangleData } from "../../data/shapes/RectangleData";

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
