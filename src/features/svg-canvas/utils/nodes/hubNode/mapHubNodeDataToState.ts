import { createDataToStateMapper } from "../../core/createDataToStateMapper";
import { HubNodeDefaultState } from "../../../constants/state/nodes/HubNodeDefaultState";
import type { HubNodeData } from "../../../types/data/nodes/HubNodeData";
import type { HubNodeState } from "../../../types/state/nodes/HubNodeState";

export const mapHubNodeDataToState = createDataToStateMapper<HubNodeState>(
	HubNodeDefaultState,
);

export const hubNodeDataToState = (data: HubNodeData): HubNodeState =>
	mapHubNodeDataToState(data);