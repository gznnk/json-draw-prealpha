import { createDataToStateMapper } from "../../core/createDataToStateMapper";
import { DefaultPageDesignNodeState } from "../../../constants/state/nodes/DefaultPageDesignNodeState";
import type { PageDesignNodeData } from "../../../types/data/nodes/PageDesignNodeData";
import type { PageDesignNodeState } from "../../../types/state/nodes/PageDesignNodeState";

export const mapPageDesignNodeDataToState = createDataToStateMapper<PageDesignNodeState>(
	DefaultPageDesignNodeState,
);

export const pageDesignNodeDataToState = (data: PageDesignNodeData): PageDesignNodeState =>
	mapPageDesignNodeDataToState(data);