import type { ConnectPointState } from "../../../types/diagrams/shapes/ConnectTypes";
import type { ConnectableState } from "../../../types/diagrams/shapes/ConnectableTypes";

export const DefaultConnectableState = {
	showConnectPoints: false,
	connectPoints: [] as ConnectPointState[],
} as const satisfies ConnectableState;
