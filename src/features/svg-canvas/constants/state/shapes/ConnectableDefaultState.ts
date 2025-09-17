import type { ConnectPointState } from "../../../types/state/shapes/ConnectPointState";
import type { ConnectableState } from "../../../types/state/shapes/ConnectableState";

export const ConnectableDefaultState = {
	connectEnabled: true,
	showConnectPoints: false,
	connectPoints: [] as ConnectPointState[],
} as const satisfies ConnectableState;
