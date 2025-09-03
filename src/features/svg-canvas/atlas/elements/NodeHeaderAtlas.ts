/**
 * NodeHeader Element Atlas
 *
 * Complete index and registry for NodeHeader element-related components.
 * This atlas provides centralized access to all NodeHeader-related types,
 * default values, components, and utility functions.
 *
 * This file serves both as a developer reference and as a programmatic
 * registry for the DiagramRegistry system.
 */
// ============================================================================
// Types
// ============================================================================
import type { NodeHeaderData } from "../../types/data/elements/NodeHeaderData";
import { NodeHeaderFeatures } from "../../types/data/elements/NodeHeaderData";
import type { NodeHeaderProps } from "../../types/props/elements/NodeHeaderProps";
import type { NodeHeaderState } from "../../types/state/elements/NodeHeaderState";
import type { DiagramAtlas } from "../DiagramAtlas";

// ============================================================================
// Defaults
// ============================================================================
import { NodeHeaderDefaultData } from "../../constants/data/elements/NodeHeaderDefaultData";
import { NodeHeaderDefaultState } from "../../constants/state/elements/NodeHeaderDefaultState";

// ============================================================================
// Components
// ============================================================================
import { NodeHeaderMinimap } from "../../components/elements/NodeHeader";
import { DummyComponent } from "../DiagramAtlas";

// ============================================================================
// Utility Functions
// ============================================================================
import { dummyImplementation } from "../DiagramAtlas";
import { createNodeHeaderState } from "../../utils/elements/nodeHeader/createNodeHeaderState";

/**
 * NodeHeader Element Atlas Type Definition
 */
type NodeHeaderAtlas = DiagramAtlas<NodeHeaderData, NodeHeaderState, NodeHeaderProps>;

/**
 * NodeHeader Element Atlas Implementation
 */
export const NodeHeaderAtlas: NodeHeaderAtlas = {
	// ============================================================================
	// Types
	// ============================================================================

	type: "NodeHeader",
	features: NodeHeaderFeatures,

	// ============================================================================
	// Defaults
	// ============================================================================

	defaultData: NodeHeaderDefaultData,
	defaultState: NodeHeaderDefaultState,

	// ============================================================================
	// Components
	// ============================================================================

	component: DummyComponent, // Using dummy since not registering to registry
	minimapComponent: NodeHeaderMinimap,

	// ============================================================================
	// Utility Functions
	// ============================================================================

	createState: createNodeHeaderState,
	export: undefined,
	calcConnectPointPosition: dummyImplementation,
	dataToState: dummyImplementation,
	stateToData: dummyImplementation,
};