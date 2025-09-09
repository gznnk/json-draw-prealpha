/**
 * Rectangle Shape Atlas
 *
 * Complete index and registry for Rectangle shape-related components.
 * This atlas provides centralized access to all Rectangle-related types,
 * default values, components, and utility functions.
 *
 * This file serves both as a developer reference and as a programmatic
 * registry for the DiagramRegistry system.
 */
// ============================================================================
// Types
// ============================================================================
import type { RectangleData } from "../../types/data/shapes/RectangleData";
import { RectangleFeatures } from "../../types/data/shapes/RectangleData";
import type { RectangleProps } from "../../types/props/shapes/RectangleProps";
import type { RectangleState } from "../../types/state/shapes/RectangleState";
import type {
	DataToStateMapper,
	DiagramAtlas,
	StateToDataMapper,
} from "../DiagramAtlas";

// ============================================================================
// Defaults
// ============================================================================
import { RectangleDefaultData } from "../../constants/data/shapes/RectangleDefaultData";
import { RectangleDefaultState } from "../../constants/state/shapes/RectangleDefaultState";

// ============================================================================
// Components
// ============================================================================
import { Rectangle, RectangleMinimap } from "../../components/shapes/Rectangle";

import { calcRectangleConnectPointPosition } from "../../utils/shapes/rectangle/calcRectangleConnectPointPosition";
// ============================================================================
// Utility Functions
// ============================================================================
import { createRectangleState } from "../../utils/shapes/rectangle/createRectangleState";
import { rectangleDataToState } from "../../utils/shapes/rectangle/mapRectangleDataToState";
import { rectangleStateToData } from "../../utils/shapes/rectangle/mapRectangleStateToData";

/**
 * Rectangle Shape Atlas Type Definition
 */
type RectangleAtlas = DiagramAtlas<
	RectangleData,
	RectangleState,
	RectangleProps
>;

/**
 * Rectangle Shape Atlas Implementation
 */
export const RectangleAtlas: RectangleAtlas = {
	// ============================================================================
	// Types
	// ============================================================================

	type: "Rectangle",
	features: RectangleFeatures,

	// ============================================================================
	// Defaults
	// ============================================================================

	defaultData: RectangleDefaultData,
	defaultState: RectangleDefaultState,

	// ============================================================================
	// Components
	// ============================================================================

	component: Rectangle,
	minimapComponent: RectangleMinimap,

	// ============================================================================
	// Utility Functions
	// ============================================================================

	createState: createRectangleState,
	export: undefined,
	calcConnectPointPosition: calcRectangleConnectPointPosition,
	transformItems: undefined,
	dataToState: rectangleDataToState as DataToStateMapper,
	stateToData: rectangleStateToData as StateToDataMapper,
};
