import type { ArrowHeadType } from "../../core/ArrowHeadType";
import type { PathType } from "../../core/PathType";
import type { CreateDataType } from "./CreateDataType";

/**
 * Data type for connection lines between diagram elements.
 * Contains properties for defining connection endpoints and visual styling.
 */
export type ConnectLineData = CreateDataType<{
	transformative: true;
	itemable: true;
	strokable: true;
}> & {
	pathType: PathType;
	startOwnerId: string;
	endOwnerId: string;
	autoRouting: boolean;
	startArrowHead?: ArrowHeadType;
	endArrowHead?: ArrowHeadType;
};
