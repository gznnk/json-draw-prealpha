/**
 * ImageGenNode Atlas
 *
 * Complete index and registry for ImageGenNode-related components.
 * This atlas provides centralized access to all ImageGenNode-related types,
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
import type { ImageGenNodeData } from "../../types/data/nodes/ImageGenNodeData";
import type { ImageGenNodeState } from "../../types/state/nodes/ImageGenNodeState";
import type { ImageGenNodeProps } from "../../types/props/nodes/ImageGenNodeProps";
import { ImageGenNodeFeatures } from "../../types/data/nodes/ImageGenNodeData";

// ============================================================================
// Defaults
// ============================================================================
import { ImageGenNodeDefaultData } from "../../constants/data/nodes/ImageGenNodeDefaultData";
import { ImageGenNodeDefaultState } from "../../constants/state/nodes/ImageGenNodeDefaultState";

// ============================================================================
// Components
// ============================================================================
import { ImageGenNode, ImageGenNodeMinimap } from "../../components/nodes/ImageGenNode";

// ============================================================================
// Utility Functions
// ============================================================================
import { createImageGenNodeState } from "../../utils/nodes/imageGenNode/createImageGenNodeState";
import { calcRectangleConnectPointPosition } from "../../utils/shapes/rectangle/calcRectangleConnectPointPosition";
import { imageGenNodeStateToData } from "../../utils/nodes/imageGenNode/mapImageGenNodeStateToData";
import { mapImageGenNodeDataToState } from "../../utils/nodes/imageGenNode/mapImageGenNodeDataToState";

/**
 * ImageGenNode Atlas Type Definition
 */
type ImageGenNodeAtlas = DiagramAtlas<
	ImageGenNodeData,
	ImageGenNodeState,
	ImageGenNodeProps
>;

/**
 * ImageGenNode Atlas Implementation
 */
export const ImageGenNodeAtlas: ImageGenNodeAtlas = {
	// ============================================================================
	// Types
	// ============================================================================

	type: "ImageGenNode",
	features: ImageGenNodeFeatures,

	// ============================================================================
	// Defaults
	// ============================================================================

	defaultData: ImageGenNodeDefaultData,
	defaultState: ImageGenNodeDefaultState,

	// ============================================================================
	// Components
	// ============================================================================

	component: ImageGenNode,
	minimapComponent: ImageGenNodeMinimap,

	// ============================================================================
	// Utility Functions
	// ============================================================================

	createState: createImageGenNodeState,
	export: undefined,
	calcConnectPointPosition: calcRectangleConnectPointPosition,
	transformItems: undefined,
	dataToState: mapImageGenNodeDataToState as DataToStateMapper,
	stateToData: imageGenNodeStateToData as StateToDataMapper,
};