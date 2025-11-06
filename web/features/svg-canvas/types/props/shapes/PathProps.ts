import type { CreateDiagramProps } from "./CreateDiagramProps";
import type { PathDragType } from "../../core/PathDragType";
import type { PathFeatures } from "../../data/shapes/PathData";
import type { PathState } from "../../state/shapes/PathState";

/**
 * Props for Path component
 */
export type PathProps = CreateDiagramProps<
	PathState,
	typeof PathFeatures,
	{
		dragType?: PathDragType;
		fixBothEnds?: boolean;
	}
>;
