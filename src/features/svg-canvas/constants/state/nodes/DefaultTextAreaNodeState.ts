import { DefaultSelectableState } from "../core/DefaultSelectableState";
import { DefaultStrokableState } from "../core/DefaultStrokableState";
import { DefaultFillableState } from "../core/DefaultFillableState";
import { DefaultTextableState } from "../core/DefaultTextableState";
import { DefaultTransformativeState } from "../core/DefaultTransformativeState";
import { DefaultConnectableState } from "../shapes/DefaultConnectableState";
import { TextAreaNodeDefaultData } from "../../data/nodes/TextAreaNodeDefaultData";
import type { TextAreaNodeState } from "../../../types/state/nodes/TextAreaNodeState";

export const DefaultTextAreaNodeState = {
	...TextAreaNodeDefaultData,
	...DefaultSelectableState,
	...DefaultStrokableState,
	...DefaultFillableState,
	...DefaultTextableState,
	...DefaultTransformativeState,
	...DefaultConnectableState,
} as const satisfies TextAreaNodeState;
