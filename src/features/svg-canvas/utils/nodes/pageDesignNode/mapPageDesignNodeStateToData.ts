import { createStateToDataMapper } from "../../core/createStateToDataMapper";
import { PageDesignNodeDefaultData } from "../../../constants/data/nodes/PageDesignNodeDefaultData";
import type { PageDesignNodeData } from "../../../types/data/nodes/PageDesignNodeData";
import type { PageDesignNodeState } from "../../../types/state/nodes/PageDesignNodeState";

export const mapPageDesignNodeStateToData = createStateToDataMapper<PageDesignNodeData>(
	PageDesignNodeDefaultData,
);

export const pageDesignNodeStateToData = (state: PageDesignNodeState): PageDesignNodeData =>
	mapPageDesignNodeStateToData(state);