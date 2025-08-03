import { createStateToDataMapper } from "../../core/createStateToDataMapper";
import { HubNodeDefaultData } from "../../../constants/data/nodes/HubNodeDefaultData";
import type { HubNodeData } from "../../../types/data/nodes/HubNodeData";
import type { HubNodeState } from "../../../types/state/nodes/HubNodeState";

export const mapHubNodeStateToData = createStateToDataMapper<HubNodeData>(
	HubNodeDefaultData,
);

export const hubNodeStateToData = (state: HubNodeState): HubNodeData =>
	mapHubNodeStateToData(state);