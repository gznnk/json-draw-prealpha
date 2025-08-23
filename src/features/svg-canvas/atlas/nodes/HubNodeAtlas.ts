/**
 * HubNode Atlas
 *
 * Complete index and registry for HubNode-related components.
 * This atlas provides centralized access to all HubNode-related types,
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
import type { HubNodeData } from "../../types/data/nodes/HubNodeData";
import type { HubNodeState } from "../../types/state/nodes/HubNodeState";
import type { HubNodeProps } from "../../types/props/nodes/HubNodeProps";
import { HubNodeFeatures } from "../../types/data/nodes/HubNodeData";

// ============================================================================
// Defaults
// ============================================================================
import { HubNodeDefaultData } from "../../constants/data/nodes/HubNodeDefaultData";
import { HubNodeDefaultState } from "../../constants/state/nodes/HubNodeDefaultState";

// ============================================================================
// Components
// ============================================================================
import { HubNode, HubNodeMinimap } from "../../components/nodes/HubNode";

// ============================================================================
// Utility Functions
// ============================================================================
import { createHubNodeState } from "../../utils/nodes/hubNode/createHubNodeState";
import { calcEllipseConnectPointPosition } from "../../utils/shapes/ellipse/calcEllipseConnectPointPosition";
import { hubNodeStateToData } from "../../utils/nodes/hubNode/mapHubNodeStateToData";
import { mapHubNodeDataToState } from "../../utils/nodes/hubNode/mapHubNodeDataToState";

/**
 * HubNode Atlas Type Definition
 */
type HubNodeAtlas = DiagramAtlas<
	HubNodeData,
	HubNodeState,
	HubNodeProps
>;

/**
 * HubNode Atlas Implementation
 */
export const HubNodeAtlas: HubNodeAtlas = {
	// ============================================================================
	// Types
	// ============================================================================

	type: "HubNode",
	features: HubNodeFeatures,

	// ============================================================================
	// Defaults
	// ============================================================================

	defaultData: HubNodeDefaultData,
	defaultState: HubNodeDefaultState,

	// ============================================================================
	// Components
	// ============================================================================

	component: HubNode,
	minimapComponent: HubNodeMinimap,

	// ============================================================================
	// Utility Functions
	// ============================================================================

	createState: createHubNodeState,
	export: undefined,
	calcConnectPointPosition: calcEllipseConnectPointPosition,
	dataToState: mapHubNodeDataToState as DataToStateMapper,
	stateToData: hubNodeStateToData as StateToDataMapper,
};