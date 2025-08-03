import { DefaultRectangleState } from "../shapes/DefaultRectangleState";
import type { WebSearchNodeState } from "../../../types/state/nodes/WebSearchNodeState";

export const DefaultWebSearchNodeState = {
	...DefaultRectangleState,
	type: "WebSearchNode",
} as const satisfies WebSearchNodeState;