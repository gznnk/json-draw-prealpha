/**
 * ConnectLine Shape Atlas
 *
 * Complete index and registry for ConnectLine shape-related components.
 * This atlas provides centralized access to all ConnectLine-related types,
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
import type { ConnectLineData } from "../../types/data/shapes/ConnectLineData";
import type { ConnectLineState } from "../../types/state/shapes/ConnectLineState";
import type { ConnectLineProps } from "../../types/props/shapes/ConnectLineProps";
import { ConnectLineFeatures } from "../../types/data/shapes/ConnectLineData";

// ============================================================================
// Defaults
// ============================================================================
import { ConnectLineDefaultData } from "../../constants/data/shapes/ConnectLineDefaultData";
import { ConnectLineDefaultState } from "../../constants/state/shapes/ConnectLineDefaultState";

// ============================================================================
// Components
// ============================================================================
import { ConnectLine, ConnectLineMinimap } from "../../components/shapes/ConnectLine";

// ============================================================================
// Utility Functions
// ============================================================================
import { connectLineStateToData } from "../../utils/shapes/connectLine/mapConnectLineStateToData";
import { mapConnectLineDataToState } from "../../utils/shapes/connectLine/mapConnectLineDataToState";

/**
 * ConnectLine Shape Atlas Type Definition
 */
type ConnectLineAtlas = DiagramAtlas<
	ConnectLineData,
	ConnectLineState,
	ConnectLineProps
>;

/**
 * ConnectLine Shape Atlas Implementation
 */
export const ConnectLineAtlas: ConnectLineAtlas = {
	// ============================================================================
	// Types
	// ============================================================================

	type: "ConnectLine",
	features: ConnectLineFeatures,

	// ============================================================================
	// Defaults
	// ============================================================================

	defaultData: ConnectLineDefaultData,
	defaultState: ConnectLineDefaultState,

	// ============================================================================
	// Components
	// ============================================================================

	component: ConnectLine,
	minimapComponent: ConnectLineMinimap,

	// ============================================================================
	// Utility Functions
	// ============================================================================

	createState: (props: { x: number; y: number }) => ({
		...ConnectLineDefaultState,
		x: props.x,
		y: props.y,
	}),
	export: undefined,
	calcConnectPointPosition: () => [],
	dataToState: mapConnectLineDataToState as DataToStateMapper,
	stateToData: connectLineStateToData as StateToDataMapper,
};