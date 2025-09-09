import { createStateToDataMapper } from "../../core/createStateToDataMapper";
import { VectorStoreNodeDefaultData } from "../../../constants/data/nodes/VectorStoreNodeDefaultData";
import type { VectorStoreNodeData } from "../../../types/data/nodes/VectorStoreNodeData";
import type { VectorStoreNodeState } from "../../../types/state/nodes/VectorStoreNodeState";
import type { Diagram } from "../../../types/state/catalog/Diagram";
import type { DiagramData } from "../../../types/data/catalog/DiagramData";

export const mapVectorStoreNodeStateToData = createStateToDataMapper<VectorStoreNodeData>(
	VectorStoreNodeDefaultData,
);

export const vectorStoreNodeStateToData = (state: Diagram): DiagramData =>
	mapVectorStoreNodeStateToData(state as VectorStoreNodeState);