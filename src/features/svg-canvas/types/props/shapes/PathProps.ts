// Import types.
import type { PathFeatures } from "../../data/shapes/PathData";
import type { PathState } from "../../state/shapes/PathState";
import type { CreateDiagramProps } from "./CreateDiagramProps";

/**
 * Props for Path component
 */
export type PathProps = CreateDiagramProps<PathState, typeof PathFeatures, {
	dragEnabled?: boolean;
	transformEnabled?: boolean;
	verticesModeEnabled?: boolean;
	rightAngleSegmentDrag?: boolean;
	fixBothEnds?: boolean;
}>;
