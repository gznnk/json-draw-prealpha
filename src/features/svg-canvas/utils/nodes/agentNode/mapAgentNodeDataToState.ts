import { createDataToStateMapper } from "../../core/createDataToStateMapper";
import { AgentNodeDefaultState } from "../../../constants/state/nodes/AgentNodeDefaultState";
import type { AgentNodeData } from "../../../types/data/nodes/AgentNodeData";
import type { AgentNodeState } from "../../../types/state/nodes/AgentNodeState";

export const mapAgentNodeDataToState = createDataToStateMapper<AgentNodeState>(
	AgentNodeDefaultState,
);

export const agentNodeDataToState = (data: AgentNodeData): AgentNodeState =>
	mapAgentNodeDataToState(data);