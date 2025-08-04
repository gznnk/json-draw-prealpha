import { createDataToStateMapper } from "../../core/createDataToStateMapper";
import { DefaultAgentNodeState } from "../../../constants/state/nodes/DefaultAgentNodeState";
import type { AgentNodeData } from "../../../types/data/nodes/AgentNodeData";
import type { AgentNodeState } from "../../../types/state/nodes/AgentNodeState";

export const mapAgentNodeDataToState = createDataToStateMapper<AgentNodeState>(
	DefaultAgentNodeState,
);

export const agentNodeDataToState = (data: AgentNodeData): AgentNodeState =>
	mapAgentNodeDataToState(data);