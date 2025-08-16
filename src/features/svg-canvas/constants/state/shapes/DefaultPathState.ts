import { DefaultDiagramBaseState } from "../core/DefaultDiagramBaseState";
import { DefaultSelectableState } from "../core/DefaultSelectableState";
import { DefaultTransformativeState } from "../core/DefaultTransformativeState";
import { DefaultItemableState } from "../core/DefaultItemableState";
import { DefaultStrokableState } from "../core/DefaultStrokableState";
import type { PathState } from "../../../types/state/shapes/PathState";

export const DefaultPathState = {
	...DefaultDiagramBaseState,
	...DefaultSelectableState,
	...DefaultTransformativeState,
	...DefaultItemableState,
	...DefaultStrokableState,
	type: "Path",
	pathType: "Linear",
} as const satisfies PathState;