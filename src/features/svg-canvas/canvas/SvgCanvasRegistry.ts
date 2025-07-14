// Import registry
import { DiagramRegistry } from "../registry";

// Import shape components and their functions
import { ConnectLine } from "../components/shapes/ConnectLine";
import { ConnectPoint } from "../components/shapes/ConnectPoint";
import { Ellipse } from "../components/shapes/Ellipse";
import { Group } from "../components/shapes/Group";
import { Image } from "../components/shapes/Image";
import { Path, PathPoint } from "../components/shapes/Path";
import { Rectangle } from "../components/shapes/Rectangle";
import { Svg } from "../components/shapes/Svg";

// Import node components and their functions
import { AgentNode } from "../components/nodes/AgentNode";
import { HubNode } from "../components/nodes/HubNode";
import { ImageGenNode } from "../components/nodes/ImageGenNode";
import { LLMNode } from "../components/nodes/LLMNode";
import { PageDesignNode } from "../components/nodes/PageDesignNode";
import { SvgToDiagramNode } from "../components/nodes/SvgToDiagramNode";
import { TextAreaNode } from "../components/nodes/TextAreaNode";
import { VectorStoreNode } from "../components/nodes/VectorStoreNode";
import { WebSearchNode } from "../components/nodes/WebSearchNode";

// Import connect point calculators
import { calcEllipseConnectPointPosition } from "../utils/shapes/ellipse/calcEllipseConnectPointPosition";
import { calcRectangleConnectPointPosition } from "../utils/shapes/rectangle/calcRectangleConnectPointPosition";

// Import create functions
import { createAgentNodeData } from "../components/nodes/AgentNode/AgentNodeFunctions";
import { createHubNodeData } from "../components/nodes/HubNode/HubNodeFunctions";
import { createImageGenNodeData } from "../utils/nodes/imageGenNode/createImageGenNodeData";
import { createLLMNodeData } from "../utils/nodes/llmNodeData/createLLMNodeData";
import { createPageDesignNodeData } from "../components/nodes/PageDesignNode";
import { createSvgToDiagramNodeData } from "../utils/nodes/svgToDiagramNode/createSvgToDiagramNodeData";
import { createTextAreaNodeData } from "../utils/nodes/textAreaNode/createTextAreaNodeData";
import { createVectorStoreNodeData } from "../utils/nodes/vectorStoreNode/createVectorStoreNodeData";
import { createWebSearchNodeData } from "../utils/nodes/webSearchNode/createWebSearchNodeData";
import { createEllipseData } from "../utils/shapes/ellipse/createEllipseData";
import { createImageData } from "../utils/shapes/image/createImageData";
import { createPathData } from "../utils/shapes/path/createPathData";
import { createRectangleData } from "../utils/shapes/rectangle/createRectangleData";

// Import export functions
import { imageToBlob } from "../utils/shapes/image/imageToBlob";
import { svgToBlob } from "../utils/shapes/svg/svgToBlob";

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
		component: Rectangle,
		connectPointCalculator: calcRectangleConnectPointPosition,
		createFunction: createRectangleData,
		exportFunction: undefined,
	});

	DiagramRegistry.register({
		type: "Ellipse",
		component: Ellipse,
		connectPointCalculator: calcEllipseConnectPointPosition,
		createFunction: createEllipseData,
		exportFunction: undefined,
	});

	DiagramRegistry.register({
		type: "Image",
		component: Image,
		connectPointCalculator: () => [],
		createFunction: createImageData,
		exportFunction: imageToBlob,
	});

	DiagramRegistry.register({
		type: "Path",
		component: Path,
		connectPointCalculator: () => [],
		createFunction: createPathData,
		exportFunction: undefined,
	});

	DiagramRegistry.register({
		type: "PathPoint",
		component: PathPoint,
		connectPointCalculator: () => [],
		createFunction: () => undefined,
		exportFunction: undefined,
	});

	DiagramRegistry.register({
		type: "Svg",
		component: Svg,
		connectPointCalculator: () => [],
		createFunction: () => undefined,
		exportFunction: svgToBlob,
	});

	DiagramRegistry.register({
		type: "ConnectLine",
		component: ConnectLine,
		connectPointCalculator: () => [],
		createFunction: () => undefined,
		exportFunction: undefined,
	});

	DiagramRegistry.register({
		type: "ConnectPoint",
		component: ConnectPoint,
		connectPointCalculator: () => [],
		createFunction: () => undefined,
		exportFunction: undefined,
	});

	DiagramRegistry.register({
		type: "Group",
		component: Group,
		connectPointCalculator: () => [],
		createFunction: () => undefined,
		exportFunction: undefined,
	});

	// Register node diagrams
	DiagramRegistry.register({
		type: "AgentNode",
		component: AgentNode,
		connectPointCalculator: calcRectangleConnectPointPosition,
		createFunction: createAgentNodeData,
		exportFunction: undefined,
	});

	DiagramRegistry.register({
		type: "HubNode",
		component: HubNode,
		connectPointCalculator: calcEllipseConnectPointPosition,
		createFunction: createHubNodeData,
		exportFunction: undefined,
	});

	DiagramRegistry.register({
		type: "ImageGenNode",
		component: ImageGenNode,
		connectPointCalculator: calcRectangleConnectPointPosition,
		createFunction: createImageGenNodeData,
		exportFunction: undefined,
	});

	DiagramRegistry.register({
		type: "LLMNode",
		component: LLMNode,
		connectPointCalculator: calcRectangleConnectPointPosition,
		createFunction: createLLMNodeData,
		exportFunction: undefined,
	});

	DiagramRegistry.register({
		type: "PageDesignNode",
		component: PageDesignNode,
		connectPointCalculator: calcRectangleConnectPointPosition,
		createFunction: createPageDesignNodeData,
		exportFunction: undefined,
	});

	DiagramRegistry.register({
		type: "SvgToDiagramNode",
		component: SvgToDiagramNode,
		connectPointCalculator: calcRectangleConnectPointPosition,
		createFunction: createSvgToDiagramNodeData,
		exportFunction: undefined,
	});

	DiagramRegistry.register({
		type: "TextAreaNode",
		component: TextAreaNode,
		connectPointCalculator: calcRectangleConnectPointPosition,
		createFunction: createTextAreaNodeData,
		exportFunction: undefined,
	});

	DiagramRegistry.register({
		type: "VectorStoreNode",
		component: VectorStoreNode,
		connectPointCalculator: calcRectangleConnectPointPosition,
		createFunction: createVectorStoreNodeData,
		exportFunction: undefined,
	});

	DiagramRegistry.register({
		type: "WebSearchNode",
		component: WebSearchNode,
		connectPointCalculator: calcRectangleConnectPointPosition,
		createFunction: createWebSearchNodeData,
		exportFunction: undefined,
	});
};
