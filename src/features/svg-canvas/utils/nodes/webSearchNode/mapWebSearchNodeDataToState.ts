import { createDataToStateMapper } from "../../core/createDataToStateMapper";
import { WebSearchNodeDefaultState } from "../../../constants/state/nodes/WebSearchNodeDefaultState";
import type { DiagramData } from "../../../types/data/core/DiagramData";
import type { Diagram } from "../../../types/state/core/Diagram";
import type { WebSearchNodeData } from "../../../types/data/nodes/WebSearchNodeData";
import type { WebSearchNodeState } from "../../../types/state/nodes/WebSearchNodeState";

export const mapWebSearchNodeDataToState =
	createDataToStateMapper<WebSearchNodeState>(WebSearchNodeDefaultState);

export const webSearchNodeDataToState = (data: DiagramData): Diagram =>
	mapWebSearchNodeDataToState(data as WebSearchNodeData);
