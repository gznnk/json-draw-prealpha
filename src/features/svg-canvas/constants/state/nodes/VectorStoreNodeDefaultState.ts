import { SelectableDefaultState } from "../core/SelectableDefaultState";
import { StrokableDefaultState } from "../core/StrokableDefaultState";
import { FillableDefaultState } from "../core/FillableDefaultState";
import { TextableDefaultState } from "../core/TextableDefaultState";
import { TransformativeDefaultState } from "../core/TransformativeDefaultState";
import { ConnectableDefaultState } from "../shapes/ConnectableDefaultState";
import { VectorStoreNodeDefaultData } from "../../data/nodes/VectorStoreNodeDefaultData";
import type { VectorStoreNodeState } from "../../../types/state/nodes/VectorStoreNodeState";

export const VectorStoreNodeDefaultState = {
	...VectorStoreNodeDefaultData,
	...SelectableDefaultState,
	...StrokableDefaultState,
	...FillableDefaultState,
	...TextableDefaultState,
	...TransformativeDefaultState,
	...ConnectableDefaultState,
} as const satisfies VectorStoreNodeState;
