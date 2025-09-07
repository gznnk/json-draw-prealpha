import type { ButtonData } from "../../types/data/elements/ButtonData";
import { ButtonFeatures } from "../../types/data/elements/ButtonData";
import type { ButtonProps } from "../../types/props/elements/ButtonProps";
import type { ButtonState } from "../../types/state/elements/ButtonState";
/**
 * Button Diagram Atlas
 *
 * Complete index and registry for Button diagram-related components.
 * This atlas provides centralized access to all Button-related types,
 * default values, components, and utility functions.
 *
 * This file serves both as a developer reference and as a programmatic
 * registry for the DiagramRegistry system.
 */
// ============================================================================
// Types
// ============================================================================
import type {
	DataToStateMapper,
	DiagramAtlas,
	StateToDataMapper,
} from "../DiagramAtlas";

// ============================================================================
// Defaults
// ============================================================================
import { ButtonDefaultData } from "../../constants/data/elements/ButtonDefaultData";
import { ButtonDefaultState } from "../../constants/state/elements/ButtonDefaultState";

// ============================================================================
// Components
// ============================================================================
import { Button, ButtonMinimap } from "../../components/elements/Button";

// ============================================================================
// Utility Functions
// ============================================================================
import { createButtonState } from "../../utils/elements/button/createButtonState";
import { mapButtonDataToState } from "../../utils/elements/button/mapButtonDataToState";
import { mapButtonStateToData } from "../../utils/elements/button/mapButtonStateToData";
import { calcRectangleConnectPointPosition } from "../../utils/shapes/rectangle/calcRectangleConnectPointPosition";

/**
 * Button Diagram Atlas Type Definition
 */
type ButtonAtlas = DiagramAtlas<ButtonData, ButtonState, ButtonProps>;

/**
 * Button Diagram Atlas Implementation
 */
export const ButtonAtlas: ButtonAtlas = {
	// ============================================================================
	// Types
	// ============================================================================

	type: "Button",
	features: ButtonFeatures,

	// ============================================================================
	// Defaults
	// ============================================================================

	defaultData: ButtonDefaultData,
	defaultState: ButtonDefaultState,

	// ============================================================================
	// Components
	// ============================================================================

	component: Button,
	minimapComponent: ButtonMinimap,

	// ============================================================================
	// Utility Functions
	// ============================================================================

	createState: createButtonState,
	export: undefined,
	calcConnectPointPosition: calcRectangleConnectPointPosition,
	transformItems: undefined,
	dataToState: mapButtonDataToState as DataToStateMapper,
	stateToData: mapButtonStateToData as StateToDataMapper,
};
