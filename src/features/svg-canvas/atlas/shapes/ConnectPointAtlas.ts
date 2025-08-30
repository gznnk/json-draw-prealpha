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
import type { ConnectPointData } from "../../types/data/shapes/ConnectPointData";
import type { ConnectPointProps } from "../../types/props/shapes/ConnectPointProps";
import type { ConnectPointState } from "../../types/state/shapes/ConnectPointState";
import type { DiagramAtlas } from "../DiagramAtlas";

// ============================================================================
// Defaults
// ============================================================================
import { ConnectPointDefaultData } from "../../constants/data/shapes/ConnectPointDefaultData";
import { ConnectPointDefaultState } from "../../constants/state/shapes/ConnectPointDefaultState";

// ============================================================================
// Components
// ============================================================================
import { ConnectPoint } from "../../components/shapes/ConnectPoint";
import { DummyComponent } from "../DiagramAtlas";

// ============================================================================
// Utility Functions
// ============================================================================
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
	minimapComponent: DummyComponent,

	// ============================================================================
	// Utility Functions
	// ============================================================================

	createState: dummyImplementation,
	export: undefined,
	calcConnectPointPosition: dummyImplementation,
	dataToState: dummyImplementation,
	stateToData: dummyImplementation,
};
