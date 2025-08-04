import { DefaultDiagramBaseState } from "../core/DefaultDiagramBaseState";
import { DefaultSelectableState } from "../core/DefaultSelectableState";
import { DefaultTransformativeState } from "../core/DefaultTransformativeState";
import { DefaultItemableState } from "../core/DefaultItemableState";
import type { GroupState } from "../../../types/state/shapes/GroupState";

export const DefaultGroupState = {
	...DefaultDiagramBaseState,
	...DefaultSelectableState,
	...DefaultTransformativeState,
	...DefaultItemableState,
	type: "Group",
} as const satisfies GroupState;