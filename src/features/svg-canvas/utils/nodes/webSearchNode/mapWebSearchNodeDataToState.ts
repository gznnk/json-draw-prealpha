import { createDataToStateMapper } from "../../core/createDataToStateMapper";
import { WebSearchNodeDefaultState } from "../../../constants/state/nodes/WebSearchNodeDefaultState";
import type { WebSearchNodeData } from "../../../types/data/nodes/WebSearchNodeData";
import type { WebSearchNodeState } from "../../../types/state/nodes/WebSearchNodeState";

export const mapWebSearchNodeDataToState =
	createDataToStateMapper<WebSearchNodeState>(WebSearchNodeDefaultState);

export const webSearchNodeDataToState = (
	data: WebSearchNodeData,
): WebSearchNodeState => mapWebSearchNodeDataToState(data);
