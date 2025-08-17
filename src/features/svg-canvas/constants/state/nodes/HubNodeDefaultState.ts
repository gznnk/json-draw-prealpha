import { SelectableDefaultState } from "../core/SelectableDefaultState";
import { TransformativeDefaultState } from "../core/TransformativeDefaultState";
import { ConnectableDefaultState } from "../shapes/ConnectableDefaultState";
import { HubNodeDefaultData } from "../../data/nodes/HubNodeDefaultData";
import type { HubNodeState } from "../../../types/state/nodes/HubNodeState";

export const HubNodeDefaultState = {
	...HubNodeDefaultData,
	...SelectableDefaultState,
	...TransformativeDefaultState,
	...ConnectableDefaultState,
} as const satisfies HubNodeState;
