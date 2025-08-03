import { createStateToDataMapper } from "../../core/createStateToDataMapper";
import { LLMNodeDefaultData } from "../../../constants/data/nodes/LLMNodeDefaultData";
import type { LLMNodeData } from "../../../types/data/nodes/LLMNodeData";
import type { LLMNodeState } from "../../../types/state/nodes/LLMNodeState";

export const mapLLMNodeStateToData = createStateToDataMapper<LLMNodeData>(
	LLMNodeDefaultData,
);

export const llmNodeStateToData = (state: LLMNodeState): LLMNodeData =>
	mapLLMNodeStateToData(state);