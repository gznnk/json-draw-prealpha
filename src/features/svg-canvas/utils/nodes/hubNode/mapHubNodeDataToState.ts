import { createDataToStateMapper } from "../../core/createDataToStateMapper";
import { HubNodeDefaultState } from "../../../constants/state/nodes/HubNodeDefaultState";
import type { DiagramData } from "../../../types/data/core/DiagramData";
import type { Diagram } from "../../../types/state/core/Diagram";
import type { HubNodeData } from "../../../types/data/nodes/HubNodeData";
import type { HubNodeState } from "../../../types/state/nodes/HubNodeState";

export const mapHubNodeDataToState = createDataToStateMapper<HubNodeState>(
	HubNodeDefaultState,
);

export const hubNodeDataToState = (data: DiagramData): Diagram =>
	mapHubNodeDataToState(data as HubNodeData);