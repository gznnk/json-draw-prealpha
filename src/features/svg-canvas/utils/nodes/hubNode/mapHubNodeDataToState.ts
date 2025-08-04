import { createDataToStateMapper } from "../../core/createDataToStateMapper";
import { DefaultHubNodeState } from "../../../constants/state/nodes/DefaultHubNodeState";
import type { HubNodeData } from "../../../types/data/nodes/HubNodeData";
import type { HubNodeState } from "../../../types/state/nodes/HubNodeState";

export const mapHubNodeDataToState = createDataToStateMapper<HubNodeState>(
	DefaultHubNodeState,
);

export const hubNodeDataToState = (data: HubNodeData): HubNodeState =>
	mapHubNodeDataToState(data);