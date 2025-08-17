import { createDataToStateMapper } from "../../core/createDataToStateMapper";
import { LLMNodeDefaultState } from "../../../constants/state/nodes/LLMNodeDefaultState";
import type { LLMNodeData } from "../../../types/data/nodes/LLMNodeData";
import type { LLMNodeState } from "../../../types/state/nodes/LLMNodeState";

export const mapLLMNodeDataToState =
	createDataToStateMapper<LLMNodeState>(LLMNodeDefaultState);

export const llmNodeDataToState = (data: LLMNodeData): LLMNodeState =>
	mapLLMNodeDataToState(data);
