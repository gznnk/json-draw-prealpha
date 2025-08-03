import { DefaultEllipseState } from "../shapes/DefaultEllipseState";
import type { HubNodeState } from "../../../types/state/nodes/HubNodeState";

export const DefaultHubNodeState = {
	...DefaultEllipseState,
	type: "HubNode",
} as const satisfies HubNodeState;