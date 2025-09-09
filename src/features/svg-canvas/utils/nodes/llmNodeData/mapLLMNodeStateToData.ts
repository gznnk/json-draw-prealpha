import { createStateToDataMapper } from "../../core/createStateToDataMapper";
import { LLMNodeDefaultData } from "../../../constants/data/nodes/LLMNodeDefaultData";
import type { LLMNodeData } from "../../../types/data/nodes/LLMNodeData";
import type { LLMNodeState } from "../../../types/state/nodes/LLMNodeState";
import type { Diagram } from "../../../types/state/core/Diagram";
import type { DiagramData } from "../../../types/data/catalog/DiagramData";

export const mapLLMNodeStateToData =
	createStateToDataMapper<LLMNodeData>(LLMNodeDefaultData);

export const llmNodeStateToData = (state: Diagram): DiagramData =>
	mapLLMNodeStateToData(state as LLMNodeState);
