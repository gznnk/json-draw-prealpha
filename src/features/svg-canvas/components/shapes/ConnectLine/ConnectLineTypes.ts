// Import types related to SvgCanvas.
import type { CreateDiagramType } from "../../../types/DiagramTypes";

// Import components related to SvgCanvas.
import type { ArrowHeadType } from "../../core/ArrowHead";

/**
 * 接続線のデータ
 */
export type ConnectLineData = CreateDiagramType<{
	selectable: true;
	transformative: true;
	itemable: true;
	strokable: true;
}> & {
	startOwnerId: string;
	endOwnerId: string;
	autoRouting: boolean;
	startArrowHead?: ArrowHeadType;
	endArrowHead?: ArrowHeadType;
};
