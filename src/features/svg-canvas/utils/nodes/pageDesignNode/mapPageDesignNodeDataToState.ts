import { createDataToStateMapper } from "../../core/createDataToStateMapper";
import { PageDesignNodeDefaultState } from "../../../constants/state/nodes/PageDesignNodeDefaultState";
import type { PageDesignNodeData } from "../../../types/data/nodes/PageDesignNodeData";
import type { PageDesignNodeState } from "../../../types/state/nodes/PageDesignNodeState";

export const mapPageDesignNodeDataToState =
	createDataToStateMapper<PageDesignNodeState>(PageDesignNodeDefaultState);

export const pageDesignNodeDataToState = (
	data: PageDesignNodeData,
): PageDesignNodeState => mapPageDesignNodeDataToState(data);
