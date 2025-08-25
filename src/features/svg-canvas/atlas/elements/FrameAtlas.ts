/**
 * Frame Element Atlas
 *
 * Complete index and registry for Frame element-related components.
 * This atlas provides centralized access to all Frame-related types,
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
import type { FrameData } from "../../types/data/elements/FrameData";
import type { FrameState } from "../../types/state/elements/FrameState";
import type { FrameProps } from "../../types/props/elements/FrameProps";
import { FrameFeatures } from "../../types/data/elements/FrameData";

// ============================================================================
// Defaults
// ============================================================================
import { FrameDefaultData } from "../../constants/data/elements/FrameDefaultData";
import { FrameDefaultState } from "../../constants/state/elements/FrameDefaultState";

// ============================================================================
// Components
// ============================================================================
import { Frame, FrameMinimap } from "../../components/elements/Frame";

// ============================================================================
// Utility Functions
// ============================================================================
import { createFrameState } from "../../utils/elements/frame/createFrameState";
import { frameStateToData } from "../../utils/elements/frame/mapFrameStateToData";
import { mapFrameDataToState } from "../../utils/elements/frame/mapFrameDataToState";
import { calcRectangleConnectPointPosition } from "../../utils/shapes/rectangle/calcRectangleConnectPointPosition";

/**
 * Frame Element Atlas Type Definition
 */
type FrameAtlas = DiagramAtlas<
	FrameData,
	FrameState,
	FrameProps
>;

/**
 * Frame Element Atlas Implementation
 */
export const FrameAtlas: FrameAtlas = {
	// ============================================================================
	// Types
	// ============================================================================

	type: "Frame",
	features: FrameFeatures,

	// ============================================================================
	// Defaults
	// ============================================================================

	defaultData: FrameDefaultData,
	defaultState: FrameDefaultState,

	// ============================================================================
	// Components
	// ============================================================================

	component: Frame,
	minimapComponent: FrameMinimap,

	// ============================================================================
	// Utility Functions
	// ============================================================================

	createState: createFrameState,
	export: undefined,
	calcConnectPointPosition: calcRectangleConnectPointPosition,
	dataToState: mapFrameDataToState as DataToStateMapper,
	stateToData: frameStateToData as StateToDataMapper,
};