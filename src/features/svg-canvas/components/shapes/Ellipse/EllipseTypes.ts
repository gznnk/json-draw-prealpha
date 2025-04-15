// Import types related to SvgCanvas.
import type { CreateDiagramType } from "../../../types/DiagramTypes";

/**
 * 楕円のデータ
 */
export type EllipseData = CreateDiagramType<{
	selectable: true;
	transformative: true;
	connectable: true;
	strokable: true;
	fillable: true;
	textable: true;
}>;
