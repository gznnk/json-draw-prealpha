import { createDataToStateMapper } from "../../core/createDataToStateMapper";
import { DefaultWebSearchNodeState } from "../../../constants/state/nodes/DefaultWebSearchNodeState";
import type { WebSearchNodeData } from "../../../types/data/nodes/WebSearchNodeData";
import type { WebSearchNodeState } from "../../../types/state/nodes/WebSearchNodeState";

export const mapWebSearchNodeDataToState = createDataToStateMapper<WebSearchNodeState>(
	DefaultWebSearchNodeState,
);

export const webSearchNodeDataToState = (data: WebSearchNodeData): WebSearchNodeState =>
	mapWebSearchNodeDataToState(data);