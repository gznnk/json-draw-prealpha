// Import registry
import { DiagramRegistry } from "../registry";

// Import shape components and their functions
import { Rectangle } from "../components/shapes/Rectangle";
import { Ellipse } from "../components/shapes/Ellipse";
import { Image } from "../components/shapes/Image";
import { Path } from "../components/shapes/Path";
import { PathPoint } from "../components/shapes/Path";
import { Svg } from "../components/shapes/Svg";
import { ConnectLine } from "../components/shapes/ConnectLine";
import { ConnectPoint } from "../components/shapes/ConnectPoint";
import { Group } from "../components/shapes/Group";

// Import node components and their functions
import { AgentNode } from "../components/nodes/AgentNode";
import { HubNode } from "../components/nodes/HubNode";
import { ImageGenNode } from "../components/nodes/ImageGenNode";
import { LLMNode } from "../components/nodes/LLMNode";
import { SvgToDiagramNode } from "../components/nodes/SvgToDiagramNode";
import { TextAreaNode } from "../components/nodes/TextAreaNode";
import { VectorStoreNode } from "../components/nodes/VectorStoreNode";
import { WebSearchNode } from "../components/nodes/WebSearchNode";

// Import connect point calculators
import { calcEllipseConnectPointPosition } from "../utils/shapes/ellipse/calcEllipseConnectPointPosition";
import { calcRectangleConnectPointPosition } from "../utils/shapes/rectangle/calcRectangleConnectPointPosition";

// Import create functions
import { createEllipseData } from "../utils/shapes/ellipse/createEllipseData";
import { createImageData } from "../utils/shapes/image/createImageData";
import { createPathData } from "../utils/shapes/path/createPathData";
import { createRectangleData } from "../utils/shapes/rectangle/createRectangleData";
import { createAgentNodeData } from "../components/nodes/AgentNode/AgentNodeFunctions";
import { createHubNodeData } from "../components/nodes/HubNode/HubNodeFunctions";
import { createImageGenNodeData } from "../utils/nodes/imageGenNode/createImageGenNodeData";
import { createLLMNodeData } from "../utils/nodes/llmNodeData/createLLMNodeData";
import { createSvgToDiagramNodeData } from "../utils/nodes/svgToDiagramNode/createSvgToDiagramNodeData";
import { createTextAreaNodeData } from "../utils/nodes/textAreaNode/createTextAreaNodeData";
import { createVectorStoreNodeData } from "../utils/nodes/vectorStoreNode/createVectorStoreNodeData";
import { createWebSearchNodeData } from "../utils/nodes/webSearchNode/createWebSearchNodeData";

// Import export functions
import { imageToBlob } from "../utils/shapes/image/imageToBlob";
import { svgToBlob } from "../components/shapes/Svg/SvgFunctions";

/**
 * Initialize all diagram registrations for the SvgCanvas.
 * This function must be called before using any diagram components.
 */
export const initializeSvgCanvasDiagrams = (): void => {
	// Clear existing registrations to avoid duplicates
	DiagramRegistry.clear();

	// Register shape diagrams
	DiagramRegistry.register({
		type: "Rectangle",
		component: () => Rectangle,
		connectPointCalculator: (diagram) =>
			calcRectangleConnectPointPosition(diagram),
		createFunction: (props) => createRectangleData(props),
		exportFunction: undefined,
	});

	DiagramRegistry.register({
		type: "Ellipse",
		component: () => Ellipse,
		connectPointCalculator: (diagram) =>
			calcEllipseConnectPointPosition(diagram),
		createFunction: (props) => createEllipseData(props),
		exportFunction: undefined,
	});

	DiagramRegistry.register({
		type: "Image",
		component: () => Image,
		connectPointCalculator: () => [],
		createFunction: (props) => createImageData(props),
		exportFunction: imageToBlob,
	});

	DiagramRegistry.register({
		type: "Path",
		component: () => Path,
		connectPointCalculator: () => [],
		createFunction: (props) => createPathData(props),
		exportFunction: undefined,
	});

	DiagramRegistry.register({
		type: "PathPoint",
		component: () => PathPoint,
		connectPointCalculator: () => [],
		createFunction: () => undefined,
		exportFunction: undefined,
	});

	DiagramRegistry.register({
		type: "Svg",
		component: () => Svg,
		connectPointCalculator: () => [],
		createFunction: () => undefined,
		exportFunction: svgToBlob,
	});

	DiagramRegistry.register({
		type: "ConnectLine",
		component: () => ConnectLine,
		connectPointCalculator: () => [],
		createFunction: () => undefined,
		exportFunction: undefined,
	});

	DiagramRegistry.register({
		type: "ConnectPoint",
		component: () => ConnectPoint,
		connectPointCalculator: () => [],
		createFunction: () => undefined,
		exportFunction: undefined,
	});

	DiagramRegistry.register({
		type: "Group",
		component: () => Group,
		connectPointCalculator: () => [],
		createFunction: () => undefined,
		exportFunction: undefined,
	});

	// Register node diagrams
	DiagramRegistry.register({
		type: "AgentNode",
		component: () => AgentNode,
		connectPointCalculator: (diagram) =>
			calcRectangleConnectPointPosition(diagram),
		createFunction: (props) => createAgentNodeData(props),
		exportFunction: undefined,
	});

	DiagramRegistry.register({
		type: "HubNode",
		component: () => HubNode,
		connectPointCalculator: (diagram) =>
			calcEllipseConnectPointPosition(diagram),
		createFunction: (props) => createHubNodeData(props),
		exportFunction: undefined,
	});

	DiagramRegistry.register({
		type: "ImageGenNode",
		component: () => ImageGenNode,
		connectPointCalculator: (diagram) =>
			calcRectangleConnectPointPosition(diagram),
		createFunction: (props) => createImageGenNodeData(props),
		exportFunction: undefined,
	});

	DiagramRegistry.register({
		type: "LLMNode",
		component: () => LLMNode,
		connectPointCalculator: (diagram) =>
			calcRectangleConnectPointPosition(diagram),
		createFunction: (props) => createLLMNodeData(props),
		exportFunction: undefined,
	});

	DiagramRegistry.register({
		type: "SvgToDiagramNode",
		component: () => SvgToDiagramNode,
		connectPointCalculator: (diagram) =>
			calcRectangleConnectPointPosition(diagram),
		createFunction: (props) => createSvgToDiagramNodeData(props),
		exportFunction: undefined,
	});

	DiagramRegistry.register({
		type: "TextAreaNode",
		component: () => TextAreaNode,
		connectPointCalculator: (diagram) =>
			calcRectangleConnectPointPosition(diagram),
		createFunction: (props) => createTextAreaNodeData(props),
		exportFunction: undefined,
	});

	DiagramRegistry.register({
		type: "VectorStoreNode",
		component: () => VectorStoreNode,
		connectPointCalculator: (diagram) =>
			calcRectangleConnectPointPosition(diagram),
		createFunction: (props) => createVectorStoreNodeData(props),
		exportFunction: undefined,
	});

	DiagramRegistry.register({
		type: "WebSearchNode",
		component: () => WebSearchNode,
		connectPointCalculator: (diagram) =>
			calcRectangleConnectPointPosition(diagram),
		createFunction: (props) => createWebSearchNodeData(props),
		exportFunction: undefined,
	});
};
