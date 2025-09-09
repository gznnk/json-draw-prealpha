/**
 * Path Shape Atlas
 *
 * Complete index and registry for Path shape-related components.
 * This atlas provides centralized access to all Path-related types,
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
import type { PathData } from "../../types/data/shapes/PathData";
import type { PathState } from "../../types/state/shapes/PathState";
import type { PathProps } from "../../types/props/shapes/PathProps";
import { PathFeatures } from "../../types/data/shapes/PathData";

// ============================================================================
// Defaults
// ============================================================================
import { PathDefaultData } from "../../constants/data/shapes/PathDefaultData";
import { PathDefaultState } from "../../constants/state/shapes/PathDefaultState";

// ============================================================================
// Components
// ============================================================================
import { Path, PathMinimap } from "../../components/shapes/Path";

// ============================================================================
// Utility Functions
// ============================================================================
import { createPathState } from "../../utils/shapes/path/createPathState";
import { pathStateToData } from "../../utils/shapes/path/mapPathStateToData";
import { mapPathDataToState } from "../../utils/shapes/path/mapPathDataToState";

/**
 * Path Shape Atlas Type Definition
 */
type PathAtlas = DiagramAtlas<
	PathData,
	PathState,
	PathProps
>;

/**
 * Path Shape Atlas Implementation
 */
export const PathAtlas: PathAtlas = {
	// ============================================================================
	// Types
	// ============================================================================

	type: "Path",
	features: PathFeatures,

	// ============================================================================
	// Defaults
	// ============================================================================

	defaultData: PathDefaultData,
	defaultState: PathDefaultState,

	// ============================================================================
	// Components
	// ============================================================================

	component: Path,
	minimapComponent: PathMinimap,

	// ============================================================================
	// Utility Functions
	// ============================================================================

	createState: createPathState,
	export: undefined,
	calcConnectPointPosition: () => [],
	transformItems: undefined,
	dataToState: mapPathDataToState as DataToStateMapper,
	stateToData: pathStateToData as StateToDataMapper,
};