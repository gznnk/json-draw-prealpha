import { DefaultSelectableState } from "../core/DefaultSelectableState";
import { DefaultStrokableState } from "../core/DefaultStrokableState";
import { DefaultFillableState } from "../core/DefaultFillableState";
import { DefaultTextableState } from "../core/DefaultTextableState";
import { DefaultTransformativeState } from "../core/DefaultTransformativeState";
import { DefaultConnectableState } from "../shapes/DefaultConnectableState";
import { WebSearchNodeDefaultData } from "../../data/nodes/WebSearchNodeDefaultData";
import type { WebSearchNodeState } from "../../../types/state/nodes/WebSearchNodeState";

export const DefaultWebSearchNodeState = {
	...WebSearchNodeDefaultData,
	...DefaultSelectableState,
	...DefaultStrokableState,
	...DefaultFillableState,
	...DefaultTextableState,
	...DefaultTransformativeState,
	...DefaultConnectableState,
} as const satisfies WebSearchNodeState;
