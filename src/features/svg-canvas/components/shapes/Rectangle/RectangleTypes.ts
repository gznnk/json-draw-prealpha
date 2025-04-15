// Import types related to SvgCanvas.
import type { CreateDiagramType } from "../../../types/DiagramTypes";

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
