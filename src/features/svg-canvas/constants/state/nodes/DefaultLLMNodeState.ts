import { DefaultRectangleState } from "../shapes/DefaultRectangleState";
import type { LLMNodeState } from "../../../types/state/nodes/LLMNodeState";

export const DefaultLLMNodeState = {
	...DefaultRectangleState,
	type: "LLMNode",
} as const satisfies LLMNodeState;