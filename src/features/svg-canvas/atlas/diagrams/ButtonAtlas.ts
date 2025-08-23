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
	DiagramAtlas,
	DataToStateMapper,
	StateToDataMapper,
} from "../DiagramAtlas";
import type { ButtonData } from "../../types/data/diagrams/ButtonData";
import type { ButtonState } from "../../types/state/diagrams/ButtonState";
import type { ButtonProps } from "../../types/props/diagrams/ButtonProps";
import { ButtonFeatures } from "../../types/data/diagrams/ButtonData";

// ============================================================================
// Defaults
// ============================================================================
import { ButtonDefaultData } from "../../constants/data/diagrams/ButtonDefaultData";
import { ButtonDefaultState } from "../../constants/state/diagrams/ButtonDefaultState";

// ============================================================================
// Components
// ============================================================================
import { Button, ButtonMinimap } from "../../components/diagrams/Button";

// ============================================================================
// Utility Functions
// ============================================================================
import { createButtonState } from "../../utils/diagrams/button/createButtonState";
import { calcButtonConnectPointPosition } from "../../utils/diagrams/button/calcButtonConnectPointPosition";
import { mapButtonStateToData } from "../../utils/diagrams/button/mapButtonStateToData";
import { mapButtonDataToState } from "../../utils/diagrams/button/mapButtonDataToState";

/**
 * Button Diagram Atlas Type Definition
 */
type ButtonAtlas = DiagramAtlas<
	ButtonData,
	ButtonState,
	ButtonProps
>;

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
	calcConnectPointPosition: calcButtonConnectPointPosition,
	dataToState: mapButtonDataToState as DataToStateMapper,
	stateToData: mapButtonStateToData as StateToDataMapper,
};