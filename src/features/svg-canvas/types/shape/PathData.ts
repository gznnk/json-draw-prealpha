import type { CreateDiagramType } from "../DiagramTypes";
import type { DiagramBaseData } from "../base";
import type { ArrowHeadType } from "../../components/core/ArrowHead";

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

/**
 * 折れ線の頂点のデータ
 */
export type PathPointData = DiagramBaseData & {
	hidden: boolean;
};
