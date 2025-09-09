import type { InputData } from "../../types/data/elements/InputData";
import { InputFeatures } from "../../types/data/elements/InputData";
import type { InputProps } from "../../types/props/elements/InputProps";
import type { InputState } from "../../types/state/elements/InputState";
/**
 * Input Shape Atlas
 *
 * Complete index and registry for Input shape-related components.
 * This atlas provides centralized access to all Input-related types,
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
import { InputDefaultData } from "../../constants/data/elements/InputDefaultData";
import { InputDefaultState } from "../../constants/state/elements/InputDefaultState";

// ============================================================================
// Components
// ============================================================================
import { Input, InputMinimap } from "../../components/elements/Input";

// ============================================================================
// Utility Functions
// ============================================================================
import { createInputState } from "../../utils/elements/input/createInputState";
import { mapInputDataToState } from "../../utils/elements/input/mapInputDataToState";
import { inputStateToData } from "../../utils/elements/input/mapInputStateToData";
import { calcRectangleConnectPointPosition } from "../../utils/shapes/rectangle/calcRectangleConnectPointPosition";

/**
 * Input Shape Atlas Type Definition
 */
type InputAtlas = DiagramAtlas<InputData, InputState, InputProps>;

/**
 * Input Shape Atlas Implementation
 */
export const InputAtlas: InputAtlas = {
	// ============================================================================
	// Types
	// ============================================================================

	type: "Input",
	features: InputFeatures,

	// ============================================================================
	// Defaults
	// ============================================================================

	defaultData: InputDefaultData,
	defaultState: InputDefaultState,

	// ============================================================================
	// Components
	// ============================================================================

	component: Input,
	minimapComponent: InputMinimap,

	// ============================================================================
	// Utility Functions
	// ============================================================================

	createState: createInputState,
	export: undefined,
	calcConnectPointPosition: calcRectangleConnectPointPosition,
	transformItems: undefined,
	dataToState: mapInputDataToState as DataToStateMapper,
	stateToData: inputStateToData as StateToDataMapper,
};
