/**
 * VectorStoreNode Atlas
 *
 * Complete index and registry for VectorStoreNode-related components.
 * This atlas provides centralized access to all VectorStoreNode-related types,
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
import type { VectorStoreNodeData } from "../../types/data/nodes/VectorStoreNodeData";
import type { VectorStoreNodeState } from "../../types/state/nodes/VectorStoreNodeState";
import type { VectorStoreNodeProps } from "../../types/props/nodes/VectorStoreNodeProps";
import { VectorStoreNodeFeatures } from "../../types/data/nodes/VectorStoreNodeData";

// ============================================================================
// Defaults
// ============================================================================
import { VectorStoreNodeDefaultData } from "../../constants/data/nodes/VectorStoreNodeDefaultData";
import { VectorStoreNodeDefaultState } from "../../constants/state/nodes/VectorStoreNodeDefaultState";

// ============================================================================
// Components
// ============================================================================
import { VectorStoreNode, VectorStoreNodeMinimap } from "../../components/nodes/VectorStoreNode";

// ============================================================================
// Utility Functions
// ============================================================================
import { createVectorStoreNodeState } from "../../utils/nodes/vectorStoreNode/createVectorStoreNodeState";
import { calcRectangleConnectPointPosition } from "../../utils/shapes/rectangle/calcRectangleConnectPointPosition";
import { vectorStoreNodeStateToData } from "../../utils/nodes/vectorStoreNode/mapVectorStoreNodeStateToData";
import { mapVectorStoreNodeDataToState } from "../../utils/nodes/vectorStoreNode/mapVectorStoreNodeDataToState";

/**
 * VectorStoreNode Atlas Type Definition
 */
type VectorStoreNodeAtlas = DiagramAtlas<
	VectorStoreNodeData,
	VectorStoreNodeState,
	VectorStoreNodeProps
>;

/**
 * VectorStoreNode Atlas Implementation
 */
export const VectorStoreNodeAtlas: VectorStoreNodeAtlas = {
	// ============================================================================
	// Types
	// ============================================================================

	type: "VectorStoreNode",
	features: VectorStoreNodeFeatures,

	// ============================================================================
	// Defaults
	// ============================================================================

	defaultData: VectorStoreNodeDefaultData,
	defaultState: VectorStoreNodeDefaultState,

	// ============================================================================
	// Components
	// ============================================================================

	component: VectorStoreNode,
	minimapComponent: VectorStoreNodeMinimap,

	// ============================================================================
	// Utility Functions
	// ============================================================================

	createState: createVectorStoreNodeState,
	export: undefined,
	calcConnectPointPosition: calcRectangleConnectPointPosition,
	dataToState: mapVectorStoreNodeDataToState as DataToStateMapper,
	stateToData: vectorStoreNodeStateToData as StateToDataMapper,
};