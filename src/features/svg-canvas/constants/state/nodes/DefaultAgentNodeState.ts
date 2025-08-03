import { DefaultRectangleState } from "../shapes/DefaultRectangleState";
import type { AgentNodeState } from "../../../types/state/nodes/AgentNodeState";

export const DefaultAgentNodeState = {
	...DefaultRectangleState,
	type: "AgentNode",
} as const satisfies AgentNodeState;