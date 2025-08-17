import { DefaultSelectableState } from "../core/DefaultSelectableState";
import { DefaultTransformativeState } from "../core/DefaultTransformativeState";
import { DefaultConnectableState } from "../shapes/DefaultConnectableState";
import { HubNodeDefaultData } from "../../data/nodes/HubNodeDefaultData";
import type { HubNodeState } from "../../../types/state/nodes/HubNodeState";

export const DefaultHubNodeState = {
	...HubNodeDefaultData,
	...DefaultSelectableState,
	...DefaultTransformativeState,
	...DefaultConnectableState,
} as const satisfies HubNodeState;
