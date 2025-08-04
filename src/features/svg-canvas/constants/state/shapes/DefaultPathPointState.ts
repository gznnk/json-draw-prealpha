import { DefaultDiagramBaseState } from "../core/DefaultDiagramBaseState";
import { DefaultSelectableState } from "../core/DefaultSelectableState";
import type { PathPointState } from "../../../types/state/shapes/PathPointState";

export const DefaultPathPointState = {
	...DefaultDiagramBaseState,
	...DefaultSelectableState,
	type: "PathPoint",
} as const satisfies PathPointState;