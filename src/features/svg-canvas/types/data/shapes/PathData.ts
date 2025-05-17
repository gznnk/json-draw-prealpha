import type { CreateDataType } from "./CreateDataType";
import type { ArrowHeadType } from "../../base/ArrowHeadType";

/**
 * Data type for polyline/path elements.
 * Contains properties for styling path elements and optional arrow heads at endpoints.
 */
export type PathData = CreateDataType<{
	selectable: true;
	transformative: true;
	itemable: true;
	strokable: true;
}> & {
	startArrowHead?: ArrowHeadType;
	endArrowHead?: ArrowHeadType;
};
