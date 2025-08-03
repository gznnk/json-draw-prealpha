import { DefaultRectangleState } from "../shapes/DefaultRectangleState";
import type { PageDesignNodeState } from "../../../types/state/nodes/PageDesignNodeState";

export const DefaultPageDesignNodeState = {
	...DefaultRectangleState,
	type: "PageDesignNode",
} as const satisfies PageDesignNodeState;