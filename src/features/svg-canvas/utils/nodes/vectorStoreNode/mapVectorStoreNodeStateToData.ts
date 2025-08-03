import { createStateToDataMapper } from "../../core/createStateToDataMapper";
import { VectorStoreNodeDefaultData } from "../../../constants/data/nodes/VectorStoreNodeDefaultData";
import type { VectorStoreNodeData } from "../../../types/data/nodes/VectorStoreNodeData";
import type { VectorStoreNodeState } from "../../../types/state/nodes/VectorStoreNodeState";

export const mapVectorStoreNodeStateToData = createStateToDataMapper<VectorStoreNodeData>(
	VectorStoreNodeDefaultData,
);

export const vectorStoreNodeStateToData = (state: VectorStoreNodeState): VectorStoreNodeData =>
	mapVectorStoreNodeStateToData(state);