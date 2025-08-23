/**
 * PageDesignNode Atlas
 *
 * Complete index and registry for PageDesignNode-related components.
 * This atlas provides centralized access to all PageDesignNode-related types,
 * default values, components, and utility functions.
 *
 * This file serves both as a developer reference and as a programmatic
 * registry for the DiagramRegistry system.
 */
// ============================================================================
// Types
// ============================================================================
import type {
	DiagramAtlas,
	DataToStateMapper,
	StateToDataMapper,
} from "../DiagramAtlas";
import type { PageDesignNodeData } from "../../types/data/nodes/PageDesignNodeData";
import type { PageDesignNodeState } from "../../types/state/nodes/PageDesignNodeState";
import type { PageDesignNodeProps } from "../../types/props/nodes/PageDesignNodeProps";
import { PageDesignNodeFeatures } from "../../types/data/nodes/PageDesignNodeData";

// ============================================================================
// Defaults
// ============================================================================
import { PageDesignNodeDefaultData } from "../../constants/data/nodes/PageDesignNodeDefaultData";
import { PageDesignNodeDefaultState } from "../../constants/state/nodes/PageDesignNodeDefaultState";

// ============================================================================
// Components
// ============================================================================
import { PageDesignNode, PageDesignNodeMinimap } from "../../components/nodes/PageDesignNode";

// ============================================================================
// Utility Functions
// ============================================================================
import { createPageDesignNodeState } from "../../utils/nodes/pageDesignNode/createPageDesignNodeState";
import { calcRectangleConnectPointPosition } from "../../utils/shapes/rectangle/calcRectangleConnectPointPosition";
import { pageDesignNodeStateToData } from "../../utils/nodes/pageDesignNode/mapPageDesignNodeStateToData";
import { mapPageDesignNodeDataToState } from "../../utils/nodes/pageDesignNode/mapPageDesignNodeDataToState";

/**
 * PageDesignNode Atlas Type Definition
 */
type PageDesignNodeAtlas = DiagramAtlas<
	PageDesignNodeData,
	PageDesignNodeState,
	PageDesignNodeProps
>;

/**
 * PageDesignNode Atlas Implementation
 */
export const PageDesignNodeAtlas: PageDesignNodeAtlas = {
	// ============================================================================
	// Types
	// ============================================================================

	type: "PageDesignNode",
	features: PageDesignNodeFeatures,

	// ============================================================================
	// Defaults
	// ============================================================================

	defaultData: PageDesignNodeDefaultData,
	defaultState: PageDesignNodeDefaultState,

	// ============================================================================
	// Components
	// ============================================================================

	component: PageDesignNode,
	minimapComponent: PageDesignNodeMinimap,

	// ============================================================================
	// Utility Functions
	// ============================================================================

	createState: createPageDesignNodeState,
	export: undefined,
	calcConnectPointPosition: calcRectangleConnectPointPosition,
	dataToState: mapPageDesignNodeDataToState as DataToStateMapper,
	stateToData: pageDesignNodeStateToData as StateToDataMapper,
};