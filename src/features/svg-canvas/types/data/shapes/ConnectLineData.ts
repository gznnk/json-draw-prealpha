import type { ArrowHeadType } from "../../base/ArrowHeadType";
import type { CreateDataType } from "./CreateDataType";

/**
 * Data type for connection lines between diagram elements.
 * Contains properties for defining connection endpoints and visual styling.
 */
export type ConnectLineData = CreateDataType<{
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
