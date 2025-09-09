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
import type { ImageGenNodeData } from "../../types/data/nodes/ImageGenNodeData";
import { ImageGenNodeFeatures } from "../../types/data/nodes/ImageGenNodeData";
import type { ImageGenNodeProps } from "../../types/props/nodes/ImageGenNodeProps";
import type { ImageGenNodeState } from "../../types/state/nodes/ImageGenNodeState";
import type {
	DataToStateMapper,
	DiagramAtlas,
	StateToDataMapper,
} from "../DiagramAtlas";

// ============================================================================
// Defaults
// ============================================================================
import { ImageGenNodeDefaultData } from "../../constants/data/nodes/ImageGenNodeDefaultData";
import { ImageGenNodeDefaultState } from "../../constants/state/nodes/ImageGenNodeDefaultState";

// ============================================================================
// Components
// ============================================================================
import {
	ImageGenNode,
	ImageGenNodeMinimap,
} from "../../components/nodes/ImageGenNode";

// ============================================================================
// Utility Functions
// ============================================================================
import { createImageGenNodeState } from "../../utils/nodes/imageGenNode/createImageGenNodeState";
import { mapImageGenNodeDataToState } from "../../utils/nodes/imageGenNode/mapImageGenNodeDataToState";
import { imageGenNodeStateToData } from "../../utils/nodes/imageGenNode/mapImageGenNodeStateToData";
import { calcRectangleConnectPointPosition } from "../../utils/shapes/rectangle/calcRectangleConnectPointPosition";

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
