import { createDataToStateMapper } from "../../core/createDataToStateMapper";
import { DefaultLLMNodeState } from "../../../constants/state/nodes/DefaultLLMNodeState";
import type { LLMNodeData } from "../../../types/data/nodes/LLMNodeData";
import type { LLMNodeState } from "../../../types/state/nodes/LLMNodeState";

export const mapLLMNodeDataToState = createDataToStateMapper<LLMNodeState>(
	DefaultLLMNodeState,
);

export const llmNodeDataToState = (data: LLMNodeData): LLMNodeState =>
	mapLLMNodeDataToState(data);