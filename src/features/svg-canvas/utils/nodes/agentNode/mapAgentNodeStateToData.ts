import { createStateToDataMapper } from "../../core/createStateToDataMapper";
import { AgentNodeDefaultData } from "../../../constants/data/nodes/AgentNodeDefaultData";
import type { AgentNodeData } from "../../../types/data/nodes/AgentNodeData";
import type { AgentNodeState } from "../../../types/state/nodes/AgentNodeState";

export const mapAgentNodeStateToData = createStateToDataMapper<AgentNodeData>(
	AgentNodeDefaultData,
);

export const agentNodeStateToData = (state: AgentNodeState): AgentNodeData =>
	mapAgentNodeStateToData(state);