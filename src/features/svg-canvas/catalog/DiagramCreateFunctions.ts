// Import types.
import type { DiagramType } from "../types/base/DiagramType";
import type { Diagram } from "./DiagramTypes";

// Import node creation functions.
import { createAgentNodeData } from "../components/nodes/AgentNode";
import { createHubNodeData } from "../components/nodes/HubNode";
import { createImageGenNodeData } from "../utils/nodes/imageGenNode/createImageGenNodeData";
import { createLLMNodeData } from "../utils/nodes/llmNodeData/createLLMNodeData";
import { createSvgToDiagramNodeData } from "../utils/nodes/svgToDiagramNode/createSvgToDiagramNodeData";
import { createTextAreaNodeData } from "../utils/nodes/textAreaNode/createTextAreaNodeData";
import { createVectorStoreNodeData } from "../utils/nodes/vectorStoreNode/createVectorStoreNodeData";
import { createWebSearchNodeData } from "../utils/nodes/webSearchNode/createWebSearchNodeData";

// Import shape creation functions.
import { createEllipseData } from "../utils/shapes/ellipse/createEllipseData";
import { createImageData } from "../utils/shapes/image/createImageData";
import { createPathData } from "../utils/shapes/path/createPathData";
import { createRectangleData } from "../utils/shapes/rectangle/createRectangleData";

/**
 * Maps diagram types to their corresponding data creation functions.
 * These functions are used to initialize new diagram elements.
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
	Ellipse: (props) => createEllipseData(props),
	Group: () => undefined,
	Image: (props) => createImageData(props),
	Path: (props) => createPathData(props),
	PathPoint: () => undefined,
	Rectangle: (props) => createRectangleData(props),
	Svg: () => undefined,
	// Nodes
	AgentNode: (props) => createAgentNodeData(props),
	HubNode: (props) => createHubNodeData(props),
	ImageGenNode: (props) => createImageGenNodeData(props),
	SvgToDiagramNode: (props) => createSvgToDiagramNodeData(props),
	LLMNode: (props) => createLLMNodeData(props),
	TextAreaNode: (props) => createTextAreaNodeData(props),
	VectorStoreNode: (props) => createVectorStoreNodeData(props),
	WebSearchNode: (props) => createWebSearchNodeData(props),
};
