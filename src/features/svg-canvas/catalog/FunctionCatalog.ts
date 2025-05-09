// Import types
import type { ConnectPointMoveData } from "../types/EventTypes";
import type { Diagram, DiagramType } from "./DiagramTypes";

// Import functions
import { createAgentNodeData } from "../components/nodes/AgentNode";
import { createHubNodeData } from "../components/nodes/HubNode";
import { createImageGenNodeData } from "../components/nodes/ImageGenNode";
import { createLLMNodeData } from "../components/nodes/LLMNode";
import { createSvgToDiagramNodeData } from "../components/nodes/SvgToDiagramNode";
import { createTextAreaNodeData } from "../components/nodes/TextAreaNode";
import { createVectorStoreNodeData } from "../components/nodes/VectorStoreNode";
import { createWebSearchNodeData } from "../components/nodes/WebSearchNode";
import {
	calcEllipseConnectPointPosition,
	createEllipseData,
} from "../components/shapes/Ellipse";
import { createImageData, imageToBlob } from "../components/shapes/Image";
import { createPathData } from "../components/shapes/Path";
import {
	calcRectangleConnectPointPosition,
	createRectangleData,
} from "../components/shapes/Rectangle";
import { svgToBlob } from "../components/shapes/Svg";

/**
 * Maps diagram types to their corresponding connect point calculation functions.
 */
export const DiagramConnectPointCalculators: {
	[key in DiagramType]: (diagram: Diagram) => ConnectPointMoveData[];
} = {
	// Shapes
	ConnectLine: () => [],
	ConnectPoint: () => [],
	Ellipse: calcEllipseConnectPointPosition,
	Group: () => [],
	Image: () => [],
	Path: () => [],
	PathPoint: () => [],
	Rectangle: calcRectangleConnectPointPosition,
	Svg: () => [],
	// Nodes
	AgentNode: calcRectangleConnectPointPosition,
	HubNode: calcEllipseConnectPointPosition,
	ImageGenNode: calcRectangleConnectPointPosition,
	SvgToDiagramNode: calcRectangleConnectPointPosition,
	LLMNode: calcRectangleConnectPointPosition,
	TextAreaNode: calcRectangleConnectPointPosition,
	VectorStoreNode: calcRectangleConnectPointPosition,
	WebSearchNode: calcRectangleConnectPointPosition,
};

/**
 * Maps diagram types to their corresponding data creation functions.
 */
export const DiagramCreateFunctions: {
	[key in DiagramType]: (props: {
		x: number;
		y: number;
	}) => Diagram | undefined;
} = {
	// Shapes
	ConnectLine: () => undefined,
	ConnectPoint: () => undefined,
	Ellipse: createEllipseData,
	Group: () => undefined,
	Image: createImageData,
	Path: createPathData,
	PathPoint: () => undefined,
	Rectangle: createRectangleData,
	Svg: () => undefined,
	// Nodes
	AgentNode: createAgentNodeData,
	HubNode: createHubNodeData,
	ImageGenNode: createImageGenNodeData,
	SvgToDiagramNode: createSvgToDiagramNodeData,
	LLMNode: createLLMNodeData,
	TextAreaNode: createTextAreaNodeData,
	VectorStoreNode: createVectorStoreNodeData,
	WebSearchNode: createWebSearchNodeData,
};

/**
 * Maps diagram types to their corresponding export functions.
 */
export const DiagramExportFunctions: {
	[key in DiagramType]: ((diagram: Diagram) => Blob | undefined) | undefined;
} = {
	// Shapes
	ConnectLine: undefined,
	ConnectPoint: undefined,
	Ellipse: undefined,
	Group: undefined,
	Image: imageToBlob,
	Path: undefined,
	PathPoint: undefined,
	Rectangle: undefined,
	Svg: svgToBlob,
	// Nodes
	AgentNode: undefined,
	HubNode: undefined,
	ImageGenNode: undefined,
	SvgToDiagramNode: undefined,
	LLMNode: undefined,
	TextAreaNode: undefined,
	VectorStoreNode: undefined,
	WebSearchNode: undefined,
};
