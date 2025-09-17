import { createDataToStateMapper } from "../../core/createDataToStateMapper";
import { VectorStoreNodeDefaultState } from "../../../constants/state/nodes/VectorStoreNodeDefaultState";
import type { DiagramData } from "../../../types/data/core/DiagramData";
import type { Diagram } from "../../../types/state/core/Diagram";
import type { VectorStoreNodeData } from "../../../types/data/nodes/VectorStoreNodeData";
import type { VectorStoreNodeState } from "../../../types/state/nodes/VectorStoreNodeState";

export const mapVectorStoreNodeDataToState =
	createDataToStateMapper<VectorStoreNodeState>(VectorStoreNodeDefaultState);

export const vectorStoreNodeDataToState = (
	data: DiagramData,
): Diagram => mapVectorStoreNodeDataToState(data as VectorStoreNodeData);
