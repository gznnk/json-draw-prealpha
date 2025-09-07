/**
 * SvgToDiagramNode Atlas
 *
 * Complete index and registry for SvgToDiagramNode-related components.
 * This atlas provides centralized access to all SvgToDiagramNode-related types,
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
import type { SvgToDiagramNodeData } from "../../types/data/nodes/SvgToDiagramNodeData";
import type { SvgToDiagramNodeState } from "../../types/state/nodes/SvgToDiagramNodeState";
import type { SvgToDiagramNodeProps } from "../../types/props/nodes/SvgToDiagramNodeProps";
import { SvgToDiagramNodeFeatures } from "../../types/data/nodes/SvgToDiagramNodeData";

// ============================================================================
// Defaults
// ============================================================================
import { SvgToDiagramNodeDefaultData } from "../../constants/data/nodes/SvgToDiagramNodeDefaultData";
import { SvgToDiagramNodeDefaultState } from "../../constants/state/nodes/SvgToDiagramNodeDefaultState";

// ============================================================================
// Components
// ============================================================================
import { SvgToDiagramNode, SvgToDiagramNodeMinimap } from "../../components/nodes/SvgToDiagramNode";

// ============================================================================
// Utility Functions
// ============================================================================
import { createSvgToDiagramNodeState } from "../../utils/nodes/svgToDiagramNode/createSvgToDiagramNodeState";
import { calcRectangleConnectPointPosition } from "../../utils/shapes/rectangle/calcRectangleConnectPointPosition";
import { svgToDiagramNodeStateToData } from "../../utils/nodes/svgToDiagramNode/mapSvgToDiagramNodeStateToData";
import { mapSvgToDiagramNodeDataToState } from "../../utils/nodes/svgToDiagramNode/mapSvgToDiagramNodeDataToState";

/**
 * SvgToDiagramNode Atlas Type Definition
 */
type SvgToDiagramNodeAtlas = DiagramAtlas<
	SvgToDiagramNodeData,
	SvgToDiagramNodeState,
	SvgToDiagramNodeProps
>;

/**
 * SvgToDiagramNode Atlas Implementation
 */
export const SvgToDiagramNodeAtlas: SvgToDiagramNodeAtlas = {
	// ============================================================================
	// Types
	// ============================================================================

	type: "SvgToDiagramNode",
	features: SvgToDiagramNodeFeatures,

	// ============================================================================
	// Defaults
	// ============================================================================

	defaultData: SvgToDiagramNodeDefaultData,
	defaultState: SvgToDiagramNodeDefaultState,

	// ============================================================================
	// Components
	// ============================================================================

	component: SvgToDiagramNode,
	minimapComponent: SvgToDiagramNodeMinimap,

	// ============================================================================
	// Utility Functions
	// ============================================================================

	createState: createSvgToDiagramNodeState,
	export: undefined,
	calcConnectPointPosition: calcRectangleConnectPointPosition,
	transformItems: undefined,
	dataToState: mapSvgToDiagramNodeDataToState as DataToStateMapper,
	stateToData: svgToDiagramNodeStateToData as StateToDataMapper,
};