import { DefaultSelectableState } from "../core/DefaultSelectableState";
import { DefaultStrokableState } from "../core/DefaultStrokableState";
import { DefaultFillableState } from "../core/DefaultFillableState";
import { DefaultTextableState } from "../core/DefaultTextableState";
import { DefaultTransformativeState } from "../core/DefaultTransformativeState";
import { DefaultConnectableState } from "../shapes/DefaultConnectableState";
import { VectorStoreNodeDefaultData } from "../../data/nodes/VectorStoreNodeDefaultData";
import type { VectorStoreNodeState } from "../../../types/state/nodes/VectorStoreNodeState";

export const DefaultVectorStoreNodeState = {
	...VectorStoreNodeDefaultData,
	...DefaultSelectableState,
	...DefaultStrokableState,
	...DefaultFillableState,
	...DefaultTextableState,
	...DefaultTransformativeState,
	...DefaultConnectableState,
} as const satisfies VectorStoreNodeState;
