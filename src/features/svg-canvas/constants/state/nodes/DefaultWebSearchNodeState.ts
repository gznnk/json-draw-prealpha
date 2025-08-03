import { DefaultEllipseState } from "../shapes/DefaultEllipseState";
import type { WebSearchNodeState } from "../../../types/state/nodes/WebSearchNodeState";

export const DefaultWebSearchNodeState = {
	...DefaultEllipseState,
	type: "WebSearchNode",
} as const satisfies WebSearchNodeState;