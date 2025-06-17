// Import types related to SvgCanvas.
import type { CreateDiagramProps } from "../core/CreateDiagramProps";
import type { PathData } from "../../data/shapes/PathData";

/**
 * Props for Path component
 */
export type PathProps = CreateDiagramProps<
	PathData,
	{
		selectable: true;
		transformative: true;
		itemable: true;
	}
> & {
	dragEnabled?: boolean;
	transformEnabled?: boolean;
	segmentDragEnabled?: boolean;
	rightAngleSegmentDrag?: boolean;
	newVertexEnabled?: boolean;
	fixBothEnds?: boolean;
	startArrowHead?: string;
	endArrowHead?: string;
};
