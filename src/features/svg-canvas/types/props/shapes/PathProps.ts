// Import types related to SvgCanvas.
import type { CreateDiagramProps } from "../core/CreateDiagramProps";
import type { PathData } from "../../data";

/**
 * 折れ線コンポーネントのプロパティ
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
