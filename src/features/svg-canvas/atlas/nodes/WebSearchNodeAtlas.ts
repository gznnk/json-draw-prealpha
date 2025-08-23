/**
 * WebSearchNode Atlas
 *
 * Complete index and registry for WebSearchNode-related components.
 * This atlas provides centralized access to all WebSearchNode-related types,
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
import type { WebSearchNodeData } from "../../types/data/nodes/WebSearchNodeData";
import type { WebSearchNodeState } from "../../types/state/nodes/WebSearchNodeState";
import type { WebSearchNodeProps } from "../../types/props/nodes/WebSearchNodeProps";
import { WebSearchNodeFeatures } from "../../types/data/nodes/WebSearchNodeData";

// ============================================================================
// Defaults
// ============================================================================
import { WebSearchNodeDefaultData } from "../../constants/data/nodes/WebSearchNodeDefaultData";
import { WebSearchNodeDefaultState } from "../../constants/state/nodes/WebSearchNodeDefaultState";

// ============================================================================
// Components
// ============================================================================
import { WebSearchNode, WebSearchNodeMinimap } from "../../components/nodes/WebSearchNode";

// ============================================================================
// Utility Functions
// ============================================================================
import { createWebSearchNodeState } from "../../utils/nodes/webSearchNode/createWebSearchNodeState";
import { calcRectangleConnectPointPosition } from "../../utils/shapes/rectangle/calcRectangleConnectPointPosition";
import { webSearchNodeStateToData } from "../../utils/nodes/webSearchNode/mapWebSearchNodeStateToData";
import { mapWebSearchNodeDataToState } from "../../utils/nodes/webSearchNode/mapWebSearchNodeDataToState";

/**
 * WebSearchNode Atlas Type Definition
 */
type WebSearchNodeAtlas = DiagramAtlas<
	WebSearchNodeData,
	WebSearchNodeState,
	WebSearchNodeProps
>;

/**
 * WebSearchNode Atlas Implementation
 */
export const WebSearchNodeAtlas: WebSearchNodeAtlas = {
	// ============================================================================
	// Types
	// ============================================================================

	type: "WebSearchNode",
	features: WebSearchNodeFeatures,

	// ============================================================================
	// Defaults
	// ============================================================================

	defaultData: WebSearchNodeDefaultData,
	defaultState: WebSearchNodeDefaultState,

	// ============================================================================
	// Components
	// ============================================================================

	component: WebSearchNode,
	minimapComponent: WebSearchNodeMinimap,

	// ============================================================================
	// Utility Functions
	// ============================================================================

	createState: createWebSearchNodeState,
	export: undefined,
	calcConnectPointPosition: calcRectangleConnectPointPosition,
	dataToState: mapWebSearchNodeDataToState as DataToStateMapper,
	stateToData: webSearchNodeStateToData as StateToDataMapper,
};