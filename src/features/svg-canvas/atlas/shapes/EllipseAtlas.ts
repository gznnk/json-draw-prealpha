/**
 * Ellipse Shape Atlas
 *
 * Complete index and registry for Ellipse shape-related components.
 * This atlas provides centralized access to all Ellipse-related types,
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
import type { EllipseData } from "../../types/data/shapes/EllipseData";
import type { EllipseState } from "../../types/state/shapes/EllipseState";
import type { EllipseProps } from "../../types/props/shapes/EllipseProps";
import { EllipseFeatures } from "../../types/data/shapes/EllipseData";

// ============================================================================
// Defaults
// ============================================================================
import { EllipseDefaultData } from "../../constants/data/shapes/EllipseDefaultData";
import { EllipseDefaultState } from "../../constants/state/shapes/EllipseDefaultState";

// ============================================================================
// Components
// ============================================================================
import { Ellipse, EllipseMinimap } from "../../components/shapes/Ellipse";

// ============================================================================
// Utility Functions
// ============================================================================
import { createEllipseState } from "../../utils/shapes/ellipse/createEllipseState";
import { calcEllipseConnectPointPosition } from "../../utils/shapes/ellipse/calcEllipseConnectPointPosition";
import { ellipseStateToData } from "../../utils/shapes/ellipse/mapEllipseStateToData";
import { mapEllipseDataToState } from "../../utils/shapes/ellipse/mapEllipseDataToState";

/**
 * Ellipse Shape Atlas Type Definition
 */
type EllipseAtlas = DiagramAtlas<
	EllipseData,
	EllipseState,
	EllipseProps
>;

/**
 * Ellipse Shape Atlas Implementation
 */
export const EllipseAtlas: EllipseAtlas = {
	// ============================================================================
	// Types
	// ============================================================================

	type: "Ellipse",
	features: EllipseFeatures,

	// ============================================================================
	// Defaults
	// ============================================================================

	defaultData: EllipseDefaultData,
	defaultState: EllipseDefaultState,

	// ============================================================================
	// Components
	// ============================================================================

	component: Ellipse,
	minimapComponent: EllipseMinimap,

	// ============================================================================
	// Utility Functions
	// ============================================================================

	createState: createEllipseState,
	export: undefined,
	calcConnectPointPosition: calcEllipseConnectPointPosition,
	transformItems: undefined,
	dataToState: mapEllipseDataToState as DataToStateMapper,
	stateToData: ellipseStateToData as StateToDataMapper,
};