import type { HubNodeState } from "../../../types/state/nodes/HubNodeState";
import { RectangleDefaultState } from "../shapes/RectangleDefaultState";

export const HubNodeDefaultState = {
	...RectangleDefaultState,
	type: "HubNode",
} as const satisfies HubNodeState;
