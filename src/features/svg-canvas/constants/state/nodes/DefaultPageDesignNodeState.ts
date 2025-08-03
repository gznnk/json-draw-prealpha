import { DefaultEllipseState } from "../shapes/DefaultEllipseState";
import type { PageDesignNodeState } from "../../../types/state/nodes/PageDesignNodeState";

export const DefaultPageDesignNodeState = {
	...DefaultEllipseState,
	type: "PageDesignNode",
} as const satisfies PageDesignNodeState;