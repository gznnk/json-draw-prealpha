import type { CreateDataType } from "./CreateDataType";
import type { ArrowHeadType } from "../../core/ArrowHeadType";
import type { PathType } from "../../core/PathType";

/**
 * Data type for polyline/path elements.
 * Contains properties for styling path elements and optional arrow heads at endpoints.
 */
export type PathData = CreateDataType<{
	transformative: true;
	itemable: true;
	strokable: true;
}> & {
	pathType: PathType;
	startArrowHead?: ArrowHeadType;
	endArrowHead?: ArrowHeadType;
};
