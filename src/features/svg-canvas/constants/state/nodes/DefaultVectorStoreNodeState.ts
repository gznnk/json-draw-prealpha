import { DefaultEllipseState } from "../shapes/DefaultEllipseState";
import type { VectorStoreNodeState } from "../../../types/state/nodes/VectorStoreNodeState";

export const DefaultVectorStoreNodeState = {
	...DefaultEllipseState,
	type: "VectorStoreNode",
} as const satisfies VectorStoreNodeState;