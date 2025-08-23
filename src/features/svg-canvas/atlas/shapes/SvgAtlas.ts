/**
 * Svg Shape Atlas
 *
 * Complete index and registry for Svg shape-related components.
 * This atlas provides centralized access to all Svg-related types,
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
import type { SvgData } from "../../types/data/shapes/SvgData";
import type { SvgState } from "../../types/state/shapes/SvgState";
import type { SvgProps } from "../../types/props/shapes/SvgProps";
import { SvgFeatures } from "../../types/data/shapes/SvgData";

// ============================================================================
// Defaults
// ============================================================================
import { SvgDefaultData } from "../../constants/data/shapes/SvgDefaultData";
import { SvgDefaultState } from "../../constants/state/shapes/SvgDefaultState";

// ============================================================================
// Components
// ============================================================================
import { Svg, SvgMinimap } from "../../components/shapes/Svg";

// ============================================================================
// Utility Functions
// ============================================================================
import { createSvgState } from "../../utils/shapes/svg/createSvgState";
import { svgToBlob } from "../../utils/shapes/svg/svgToBlob";
import { svgStateToData } from "../../utils/shapes/svg/mapSvgStateToData";
import { mapSvgDataToState } from "../../utils/shapes/svg/mapSvgDataToState";

/**
 * Svg Shape Atlas Type Definition
 */
type SvgAtlas = DiagramAtlas<
	SvgData,
	SvgState,
	SvgProps
>;

/**
 * Svg Shape Atlas Implementation
 */
export const SvgAtlas: SvgAtlas = {
	// ============================================================================
	// Types
	// ============================================================================

	type: "Svg",
	features: SvgFeatures,

	// ============================================================================
	// Defaults
	// ============================================================================

	defaultData: SvgDefaultData,
	defaultState: SvgDefaultState,

	// ============================================================================
	// Components
	// ============================================================================

	component: Svg,
	minimapComponent: SvgMinimap,

	// ============================================================================
	// Utility Functions
	// ============================================================================

	createState: (props: { x: number; y: number }) => createSvgState({ ...props, svgText: "" }),
	export: svgToBlob,
	calcConnectPointPosition: () => [],
	dataToState: mapSvgDataToState as DataToStateMapper,
	stateToData: svgStateToData as StateToDataMapper,
};