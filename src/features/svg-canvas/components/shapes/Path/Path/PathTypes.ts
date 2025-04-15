// Import types related to SvgCanvas.
import type { CreateDiagramType } from "../../../../types/DiagramTypes";

// Import components related to SvgCanvas.
import type { ArrowHeadType } from "../../../core/ArrowHead";

/**
 * 折れ線のデータ
 */
export type PathData = CreateDiagramType<{
	selectable: true;
	transformative: true;
	itemable: true;
	strokable: true;
}> & {
	startArrowHead?: ArrowHeadType;
	endArrowHead?: ArrowHeadType;
};
