/**
 * Text Shape Atlas
 *
 * Complete index and registry for Text shape-related components.
 * This atlas provides centralized access to all Text-related types,
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
import type { TextData } from "../../types/data/elements/TextData";
import type { TextState } from "../../types/state/elements/TextState";
import type { TextProps } from "../../types/props/elements/TextProps";
import { TextFeatures } from "../../types/data/elements/TextData";

// ============================================================================
// Defaults
// ============================================================================
import { TextDefaultData } from "../../constants/data/elements/TextDefaultData";
import { TextDefaultState } from "../../constants/state/elements/TextDefaultState";

// ============================================================================
// Components
// ============================================================================
import { Text, TextMinimap } from "../../components/elements/Text";

// ============================================================================
// Utility Functions
// ============================================================================
import { createTextState } from "../../utils/elements/text/createTextState";
import { textStateToData } from "../../utils/elements/text/mapTextStateToData";
import { mapTextDataToState } from "../../utils/elements/text/mapTextDataToState";

/**
 * Text Shape Atlas Type Definition
 */
type TextAtlas = DiagramAtlas<
	TextData,
	TextState,
	TextProps
>;

/**
 * Text Shape Atlas Implementation
 */
export const TextAtlas: TextAtlas = {
	// ============================================================================
	// Types
	// ============================================================================

	type: "Text",
	features: TextFeatures,

	// ============================================================================
	// Defaults
	// ============================================================================

	defaultData: TextDefaultData,
	defaultState: TextDefaultState,

	// ============================================================================
	// Components
	// ============================================================================

	component: Text,
	minimapComponent: TextMinimap,

	// ============================================================================
	// Utility Functions
	// ============================================================================

	createState: createTextState,
	export: undefined,
	calcConnectPointPosition: () => [],
	dataToState: mapTextDataToState as DataToStateMapper,
	stateToData: textStateToData as StateToDataMapper,
};