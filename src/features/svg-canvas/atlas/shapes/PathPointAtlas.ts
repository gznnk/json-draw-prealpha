/**
 * PathPoint Shape Atlas
 *
 * Complete index and registry for PathPoint shape-related components.
 * This atlas provides centralized access to all PathPoint-related types,
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
import type { PathPointData } from "../../types/data/shapes/PathPointData";
import type { PathPointState } from "../../types/state/shapes/PathPointState";
import type { PathPointProps } from "../../types/props/shapes/PathPointProps";

// ============================================================================
// Defaults
// ============================================================================
import { PathPointDefaultData } from "../../constants/data/shapes/PathPointDefaultData";
import { PathPointDefaultState } from "../../constants/state/shapes/PathPointDefaultState";

// ============================================================================
// Components
// ============================================================================
import { PathPoint } from "../../components/shapes/Path";
import { PathPointMinimap } from "../../components/shapes/Path/PathPoint";

// ============================================================================
// Utility Functions
// ============================================================================
import { pathPointStateToData } from "../../utils/shapes/path/mapPathPointStateToData";
import { mapPathPointDataToState } from "../../utils/shapes/path/mapPathPointDataToState";

/**
 * PathPoint Shape Atlas Type Definition
 */
type PathPointAtlas = DiagramAtlas<
	PathPointData,
	PathPointState,
	PathPointProps
>;

/**
 * PathPoint Shape Atlas Implementation
 */
export const PathPointAtlas: PathPointAtlas = {
	// ============================================================================
	// Types
	// ============================================================================

	type: "PathPoint",
	features: {},

	// ============================================================================
	// Defaults
	// ============================================================================

	defaultData: PathPointDefaultData,
	defaultState: PathPointDefaultState,

	// ============================================================================
	// Components
	// ============================================================================

	component: PathPoint,
	minimapComponent: PathPointMinimap,

	// ============================================================================
	// Utility Functions
	// ============================================================================

	createState: (props: { x: number; y: number }) => ({
		...PathPointDefaultState,
		x: props.x,
		y: props.y,
	}),
	export: undefined,
	calcConnectPointPosition: () => [],
	dataToState: mapPathPointDataToState as DataToStateMapper,
	stateToData: pathPointStateToData as StateToDataMapper,
};