import type { ConnectPointState } from "../../../types/state/shapes/ConnectPointState";
import type { ConnectableState } from "../../../types/state/shapes/ConnectableState";

export const DefaultConnectableState = {
	showConnectPoints: false,
	connectPoints: [] as ConnectPointState[],
} as const satisfies ConnectableState;