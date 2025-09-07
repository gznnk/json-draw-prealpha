/**
 * TextAreaNode Atlas
 *
 * Complete index and registry for TextAreaNode-related components.
 * This atlas provides centralized access to all TextAreaNode-related types,
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
import type { TextAreaNodeData } from "../../types/data/nodes/TextAreaNodeData";
import type { TextAreaNodeState } from "../../types/state/nodes/TextAreaNodeState";
import type { TextAreaNodeProps } from "../../types/props/nodes/TextAreaNodeProps";
import { TextAreaNodeFeatures } from "../../types/data/nodes/TextAreaNodeData";

// ============================================================================
// Defaults
// ============================================================================
import { TextAreaNodeDefaultData } from "../../constants/data/nodes/TextAreaNodeDefaultData";
import { TextAreaNodeDefaultState } from "../../constants/state/nodes/TextAreaNodeDefaultState";

// ============================================================================
// Components
// ============================================================================
import { TextAreaNode, TextAreaNodeMinimap } from "../../components/nodes/TextAreaNode";

// ============================================================================
// Utility Functions
// ============================================================================
import { createTextAreaNodeState } from "../../utils/nodes/textAreaNode/createTextAreaNodeState";
import { calcRectangleConnectPointPosition } from "../../utils/shapes/rectangle/calcRectangleConnectPointPosition";
import { textAreaNodeStateToData } from "../../utils/nodes/textAreaNode/mapTextAreaNodeStateToData";
import { mapTextAreaNodeDataToState } from "../../utils/nodes/textAreaNode/mapTextAreaNodeDataToState";

/**
 * TextAreaNode Atlas Type Definition
 */
type TextAreaNodeAtlas = DiagramAtlas<
	TextAreaNodeData,
	TextAreaNodeState,
	TextAreaNodeProps
>;

/**
 * TextAreaNode Atlas Implementation
 */
export const TextAreaNodeAtlas: TextAreaNodeAtlas = {
	// ============================================================================
	// Types
	// ============================================================================

	type: "TextAreaNode",
	features: TextAreaNodeFeatures,

	// ============================================================================
	// Defaults
	// ============================================================================

	defaultData: TextAreaNodeDefaultData,
	defaultState: TextAreaNodeDefaultState,

	// ============================================================================
	// Components
	// ============================================================================

	component: TextAreaNode,
	minimapComponent: TextAreaNodeMinimap,

	// ============================================================================
	// Utility Functions
	// ============================================================================

	createState: createTextAreaNodeState,
	export: undefined,
	calcConnectPointPosition: calcRectangleConnectPointPosition,
	transformItems: undefined,
	dataToState: mapTextAreaNodeDataToState as DataToStateMapper,
	stateToData: textAreaNodeStateToData as StateToDataMapper,
};