// Import types related to SvgCanvas.
import type { CreateDiagramProps } from "../../../types/props/CreateDiagramProps";
import type { RectangleData } from "../../../types/data";

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
