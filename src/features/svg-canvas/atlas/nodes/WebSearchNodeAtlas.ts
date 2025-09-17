import type { WebSearchNodeData } from "../../types/data/nodes/WebSearchNodeData";
import { WebSearchNodeFeatures } from "../../types/data/nodes/WebSearchNodeData";
import type { WebSearchNodeProps } from "../../types/props/nodes/WebSearchNodeProps";
import type { WebSearchNodeState } from "../../types/state/nodes/WebSearchNodeState";
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
	DataToStateMapper,
	DiagramAtlas,
	StateToDataMapper,
} from "../DiagramAtlas";

// ============================================================================
// Defaults
// ============================================================================
import { WebSearchNodeDefaultData } from "../../constants/data/nodes/WebSearchNodeDefaultData";
import { WebSearchNodeDefaultState } from "../../constants/state/nodes/WebSearchNodeDefaultState";

// ============================================================================
// Components
// ============================================================================
import {
	WebSearchNode,
	WebSearchNodeMinimap,
} from "../../components/nodes/WebSearchNode";

// ============================================================================
// Utility Functions
// ============================================================================
import { createWebSearchNodeState } from "../../utils/nodes/webSearchNode/createWebSearchNodeState";
import { mapWebSearchNodeDataToState } from "../../utils/nodes/webSearchNode/mapWebSearchNodeDataToState";
import { webSearchNodeStateToData } from "../../utils/nodes/webSearchNode/mapWebSearchNodeStateToData";
import { calcRectangleConnectPointPosition } from "../../utils/shapes/rectangle/calcRectangleConnectPointPosition";

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
	transformItems: undefined,
	dataToState: mapWebSearchNodeDataToState as DataToStateMapper,
	stateToData: webSearchNodeStateToData as StateToDataMapper,
};
