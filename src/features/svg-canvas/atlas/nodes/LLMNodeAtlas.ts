/**
 * LLMNode Atlas
 *
 * Complete index and registry for LLMNode-related components.
 * This atlas provides centralized access to all LLMNode-related types,
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
import type { LLMNodeData } from "../../types/data/nodes/LLMNodeData";
import type { LLMNodeState } from "../../types/state/nodes/LLMNodeState";
import type { LLMNodeProps } from "../../types/props/nodes/LLMNodeProps";
import { LLMNodeFeatures } from "../../types/data/nodes/LLMNodeData";

// ============================================================================
// Defaults
// ============================================================================
import { LLMNodeDefaultData } from "../../constants/data/nodes/LLMNodeDefaultData";
import { LLMNodeDefaultState } from "../../constants/state/nodes/LLMNodeDefaultState";

// ============================================================================
// Components
// ============================================================================
import { LLMNode, LLMNodeMinimap } from "../../components/nodes/LLMNode";

// ============================================================================
// Utility Functions
// ============================================================================
import { createLLMNodeState } from "../../utils/nodes/llmNodeData/createLLMNodeState";
import { calcRectangleConnectPointPosition } from "../../utils/shapes/rectangle/calcRectangleConnectPointPosition";
import { llmNodeStateToData } from "../../utils/nodes/llmNodeData/mapLLMNodeStateToData";
import { mapLLMNodeDataToState } from "../../utils/nodes/llmNodeData/mapLLMNodeDataToState";

/**
 * LLMNode Atlas Type Definition
 */
type LLMNodeAtlas = DiagramAtlas<
	LLMNodeData,
	LLMNodeState,
	LLMNodeProps
>;

/**
 * LLMNode Atlas Implementation
 */
export const LLMNodeAtlas: LLMNodeAtlas = {
	// ============================================================================
	// Types
	// ============================================================================

	type: "LLMNode",
	features: LLMNodeFeatures,

	// ============================================================================
	// Defaults
	// ============================================================================

	defaultData: LLMNodeDefaultData,
	defaultState: LLMNodeDefaultState,

	// ============================================================================
	// Components
	// ============================================================================

	component: LLMNode,
	minimapComponent: LLMNodeMinimap,

	// ============================================================================
	// Utility Functions
	// ============================================================================

	createState: createLLMNodeState,
	export: undefined,
	calcConnectPointPosition: calcRectangleConnectPointPosition,
	dataToState: mapLLMNodeDataToState as DataToStateMapper,
	stateToData: llmNodeStateToData as StateToDataMapper,
};