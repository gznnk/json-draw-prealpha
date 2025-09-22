import { Image, ImageMinimap } from "../../components/shapes/Image";
import { ImageDefaultData } from "../../constants/data/shapes/ImageDefaultData";
import { ImageDefaultState } from "../../constants/state/shapes/ImageDefaultState";
import type { ImageData } from "../../types/data/shapes/ImageData";
import { ImageFeatures } from "../../types/data/shapes/ImageData";
import type { ImageProps } from "../../types/props/shapes/ImageProps";
import type { ImageState } from "../../types/state/shapes/ImageState";
import { createImageState } from "../../utils/shapes/image/createImageState";
import { imageToBlob } from "../../utils/shapes/image/imageToBlob";
import { mapImageDataToState } from "../../utils/shapes/image/mapImageDataToState";
import { imageStateToData } from "../../utils/shapes/image/mapImageStateToData";
import type {
	DiagramAtlas,
	DataToStateMapper,
	StateToDataMapper,
} from "../DiagramAtlas";

/**
 * Image Shape Atlas
 *
 * Complete index and registry for Image shape-related components.
 * This atlas provides centralized access to all Image-related types,
 * default values, components, and utility functions.
 *
 * This file serves both as a developer reference and as a programmatic
 * registry for the DiagramRegistry system.
 */

/**
 * Image Shape Atlas Type Definition
 */
type ImageAtlas = DiagramAtlas<ImageData, ImageState, ImageProps>;

/**
 * Image Shape Atlas Implementation
 */
export const ImageAtlas: ImageAtlas = {
	// ============================================================================
	// Types
	// ============================================================================

	type: "Image",
	features: ImageFeatures,

	// ============================================================================
	// Defaults
	// ============================================================================

	defaultData: ImageDefaultData,
	defaultState: ImageDefaultState,

	// ============================================================================
	// Components
	// ============================================================================

	component: Image,
	minimapComponent: ImageMinimap,

	// ============================================================================
	// Utility Functions
	// ============================================================================

	createState: createImageState,
	export: imageToBlob,
	calcConnectPointPosition: () => [],
	transformItems: undefined,
	dataToState: mapImageDataToState as DataToStateMapper,
	stateToData: imageStateToData as StateToDataMapper,
};
