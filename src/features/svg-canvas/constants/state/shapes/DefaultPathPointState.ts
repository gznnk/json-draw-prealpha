import { DefaultDiagramBaseState } from "../core/DefaultDiagramBaseState";
import type { PathPointState } from "../../../types/state/shapes/PathPointState";

export const DefaultPathPointState = {
	...DefaultDiagramBaseState,
	type: "PathPoint",
} as const satisfies PathPointState;
