// Import types related to SvgCanvas.
import type {
	CreateDiagramType,
	CreateDiagramProps,
} from "../../../types/DiagramTypes";

/**
 * 矩形のデータ
 */
export type RectangleData = CreateDiagramType<{
	selectable: true;
	transformative: true;
	connectable: true;
	strokable: true;
	fillable: true;
	textable: true;
}> & {
	radius: number;
};

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
	}
>;
