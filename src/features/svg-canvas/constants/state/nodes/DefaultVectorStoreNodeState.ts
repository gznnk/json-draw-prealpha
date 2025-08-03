import { DefaultRectangleState } from "../shapes/DefaultRectangleState";
import type { VectorStoreNodeState } from "../../../types/state/nodes/VectorStoreNodeState";

export const DefaultVectorStoreNodeState = {
	...DefaultRectangleState,
	type: "VectorStoreNode",
} as const satisfies VectorStoreNodeState;