import { createDataToStateMapper } from "../../core/createDataToStateMapper";
import { DefaultVectorStoreNodeState } from "../../../constants/state/nodes/DefaultVectorStoreNodeState";
import type { VectorStoreNodeData } from "../../../types/data/nodes/VectorStoreNodeData";
import type { VectorStoreNodeState } from "../../../types/state/nodes/VectorStoreNodeState";

export const mapVectorStoreNodeDataToState = createDataToStateMapper<VectorStoreNodeState>(
	DefaultVectorStoreNodeState,
);

export const vectorStoreNodeDataToState = (data: VectorStoreNodeData): VectorStoreNodeState =>
	mapVectorStoreNodeDataToState(data);