import { DefaultEllipseState } from "../shapes/DefaultEllipseState";
import type { AgentNodeState } from "../../../types/state/nodes/AgentNodeState";

export const DefaultAgentNodeState = {
	...DefaultEllipseState,
	type: "AgentNode",
} as const satisfies AgentNodeState;