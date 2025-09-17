import { createStateToDataMapper } from "../../core/createStateToDataMapper";
import { PageDesignNodeDefaultData } from "../../../constants/data/nodes/PageDesignNodeDefaultData";
import type { PageDesignNodeData } from "../../../types/data/nodes/PageDesignNodeData";
import type { PageDesignNodeState } from "../../../types/state/nodes/PageDesignNodeState";
import type { Diagram } from "../../../types/state/core/Diagram";
import type { DiagramData } from "../../../types/data/core/DiagramData";

export const mapPageDesignNodeStateToData =
	createStateToDataMapper<PageDesignNodeData>(PageDesignNodeDefaultData);

export const pageDesignNodeStateToData = (state: Diagram): DiagramData =>
	mapPageDesignNodeStateToData(state as PageDesignNodeState);
