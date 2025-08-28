/**
 * ConnectPoint Shape Atlas
 *
 * Complete index and registry for ConnectPoint shape-related components.
 * This atlas provides centralized access to all ConnectPoint-related types,
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
import type { ConnectPointData } from "../../types/data/shapes/ConnectPointData";
import type { ConnectPointState } from "../../types/state/shapes/ConnectPointState";
import type { ConnectPointProps } from "../../types/props/shapes/ConnectPointProps";

// ============================================================================
// Defaults
// ============================================================================
import { ConnectPointDefaultData } from "../../constants/data/shapes/ConnectPointDefaultData";
import { ConnectPointDefaultState } from "../../constants/state/shapes/ConnectPointDefaultState";

// ============================================================================
// Components
// ============================================================================
import {
	ConnectPoint,
	ConnectPointMinimap,
} from "../../components/shapes/ConnectPoint";

// ============================================================================
// Utility Functions
// ============================================================================
import { connectPointStateToData } from "../../utils/shapes/connectPoint/mapConnectPointStateToData";
import { mapConnectPointDataToState } from "../../utils/shapes/connectPoint/mapConnectPointDataToState";
import { dummyImplementation } from "../DiagramAtlas";

/**
 * ConnectPoint Shape Atlas Type Definition
 */
type ConnectPointAtlas = DiagramAtlas<
	ConnectPointData,
	ConnectPointState,
	ConnectPointProps
>;

/**
 * ConnectPoint Shape Atlas Implementation
 */
export const ConnectPointAtlas: ConnectPointAtlas = {
	// ============================================================================
	// Types
	// ============================================================================

	type: "ConnectPoint",
	features: {},

	// ============================================================================
	// Defaults
	// ============================================================================

	defaultData: ConnectPointDefaultData,
	defaultState: ConnectPointDefaultState,

	// ============================================================================
	// Components
	// ============================================================================

	component: ConnectPoint,
	minimapComponent: ConnectPointMinimap,

	// ============================================================================
	// Utility Functions
	// ============================================================================

	createState: dummyImplementation,
	export: undefined,
	calcConnectPointPosition: dummyImplementation,
	dataToState: mapConnectPointDataToState as DataToStateMapper,
	stateToData: connectPointStateToData as StateToDataMapper,
};
