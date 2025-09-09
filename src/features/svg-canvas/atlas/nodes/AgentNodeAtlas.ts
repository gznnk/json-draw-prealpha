/**
 * AgentNode Atlas
 *
 * Complete index and registry for AgentNode-related components.
 * This atlas provides centralized access to all AgentNode-related types,
 * default values, components, and utility functions.
 *
 * This file serves both as a developer reference and as a programmatic
 * registry for the DiagramRegistry system.
 */
// ============================================================================
// Types
// ============================================================================
import type { AgentNodeData } from "../../types/data/nodes/AgentNodeData";
import { AgentNodeFeatures } from "../../types/data/nodes/AgentNodeData";
import type { AgentNodeProps } from "../../types/props/nodes/AgentNodeProps";
import type { AgentNodeState } from "../../types/state/nodes/AgentNodeState";
import type {
	DataToStateMapper,
	DiagramAtlas,
	StateToDataMapper,
} from "../DiagramAtlas";

// ============================================================================
// Defaults
// ============================================================================
import { AgentNodeDefaultData } from "../../constants/data/nodes/AgentNodeDefaultData";
import { AgentNodeDefaultState } from "../../constants/state/nodes/AgentNodeDefaultState";

// ============================================================================
// Components
// ============================================================================
import { AgentNode, AgentNodeMinimap } from "../../components/nodes/AgentNode";

// ============================================================================
// Utility Functions
// ============================================================================
import { createAgentNodeState } from "../../utils/nodes/agentNode/createAgentNodeState";
import { mapAgentNodeDataToState } from "../../utils/nodes/agentNode/mapAgentNodeDataToState";
import { agentNodeStateToData } from "../../utils/nodes/agentNode/mapAgentNodeStateToData";
import { calcRectangleConnectPointPosition } from "../../utils/shapes/rectangle/calcRectangleConnectPointPosition";

/**
 * AgentNode Atlas Type Definition
 */
type AgentNodeAtlas = DiagramAtlas<
	AgentNodeData,
	AgentNodeState,
	AgentNodeProps
>;

/**
 * AgentNode Atlas Implementation
 */
export const AgentNodeAtlas: AgentNodeAtlas = {
	// ============================================================================
	// Types
	// ============================================================================

	type: "AgentNode",
	features: AgentNodeFeatures,

	// ============================================================================
	// Defaults
	// ============================================================================

	defaultData: AgentNodeDefaultData,
	defaultState: AgentNodeDefaultState,

	// ============================================================================
	// Components
	// ============================================================================

	component: AgentNode,
	minimapComponent: AgentNodeMinimap,

	// ============================================================================
	// Utility Functions
	// ============================================================================

	createState: createAgentNodeState,
	export: undefined,
	calcConnectPointPosition: calcRectangleConnectPointPosition,
	transformItems: undefined,
	dataToState: mapAgentNodeDataToState as DataToStateMapper,
	stateToData: agentNodeStateToData as StateToDataMapper,
};