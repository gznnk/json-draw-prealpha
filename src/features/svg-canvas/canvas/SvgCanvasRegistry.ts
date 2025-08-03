// Import registry
import { DiagramRegistry } from "../registry";
import type { StateToDataMapper } from "../registry/DiagramDefinition";

// Import shape components and their functions
import { ConnectLine } from "../components/shapes/ConnectLine";
import { ConnectPoint } from "../components/shapes/ConnectPoint";
import { Ellipse } from "../components/shapes/Ellipse";
import { Group } from "../components/shapes/Group";
import { Image } from "../components/shapes/Image";
import { Path, PathPoint } from "../components/shapes/Path";
import { Rectangle } from "../components/shapes/Rectangle";
import { Svg } from "../components/shapes/Svg";

// Import minimap shape components
import { ConnectLineMinimap } from "../components/shapes/ConnectLine/ConnectLineMinimap";
import { ConnectPointMinimap } from "../components/shapes/ConnectPoint/ConnectPointMinimap";
import { EllipseMinimap } from "../components/shapes/Ellipse/EllipseMinimap";
import { GroupMinimap } from "../components/shapes/Group/GroupMinimap";
import { ImageMinimap } from "../components/shapes/Image/ImageMinimap";
import { PathMinimap } from "../components/shapes/Path/PathMinimap";
import { PathPointMinimap } from "../components/shapes/Path/PathPoint/PathPointMinimap";
import { RectangleMinimap } from "../components/shapes/Rectangle/RectangleMinimap";
import { SvgMinimap } from "../components/shapes/Svg/SvgMinimap";

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

// Import minimap node components
import { AgentNodeMinimap } from "../components/nodes/AgentNode/AgentNodeMinimap";
import { HubNodeMinimap } from "../components/nodes/HubNode/HubNodeMinimap";
import { ImageGenNodeMinimap } from "../components/nodes/ImageGenNode/ImageGenNodeMinimap";
import { LLMNodeMinimap } from "../components/nodes/LLMNode/LLMNodeMinimap";
import { PageDesignNodeMinimap } from "../components/nodes/PageDesignNode/PageDesignNodeMinimap";
import { SvgToDiagramNodeMinimap } from "../components/nodes/SvgToDiagramNode/SvgToDiagramNodeMinimap";
import { TextAreaNodeMinimap } from "../components/nodes/TextAreaNode/TextAreaNodeMinimap";
import { VectorStoreNodeMinimap } from "../components/nodes/VectorStoreNode/VectorStoreNodeMinimap";
import { WebSearchNodeMinimap } from "../components/nodes/WebSearchNode/WebSearchNodeMinimap";

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
import { createEllipseState } from "../utils/shapes/ellipse/createEllipseState";
import { createImageState } from "../utils/shapes/image/createImageState";
import { createPathState } from "../utils/shapes/path/createPathState";
import { createRectangleState } from "../utils/shapes/rectangle/createRectangleState";

// Import export functions
import { imageToBlob } from "../utils/shapes/image/imageToBlob";
import { svgToBlob } from "../utils/shapes/svg/svgToBlob";

// Import state to data mapping functions
import { connectLineStateToData } from "../utils/shapes/connectLine/mapConnectLineStateToData";
import { connectPointStateToData } from "../utils/shapes/connectPoint/mapConnectPointStateToData";
import { ellipseStateToData } from "../utils/shapes/ellipse/mapEllipseStateToData";
import { groupStateToData } from "../utils/shapes/group/mapGroupStateToData";
import { imageStateToData } from "../utils/shapes/image/mapImageStateToData";
import { pathStateToData } from "../utils/shapes/path/mapPathStateToData";
import { pathPointStateToData } from "../utils/shapes/path/mapPathPointStateToData";
import { rectangleStateToData } from "../utils/shapes/rectangle/mapRectangleStateToData";
import { svgStateToData } from "../utils/shapes/svg/mapSvgStateToData";
import { agentNodeStateToData } from "../utils/nodes/agentNode/mapAgentNodeStateToData";
import { hubNodeStateToData } from "../utils/nodes/hubNode/mapHubNodeStateToData";
import { imageGenNodeStateToData } from "../utils/nodes/imageGenNode/mapImageGenNodeStateToData";
import { llmNodeStateToData } from "../utils/nodes/llmNodeData/mapLLMNodeStateToData";
import { pageDesignNodeStateToData } from "../utils/nodes/pageDesignNode/mapPageDesignNodeStateToData";
import { svgToDiagramNodeStateToData } from "../utils/nodes/svgToDiagramNode/mapSvgToDiagramNodeStateToData";
import { textAreaNodeStateToData } from "../utils/nodes/textAreaNode/mapTextAreaNodeStateToData";
import { vectorStoreNodeStateToData } from "../utils/nodes/vectorStoreNode/mapVectorStoreNodeStateToData";
import { webSearchNodeStateToData } from "../utils/nodes/webSearchNode/mapWebSearchNodeStateToData";

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
		minimapComponent: RectangleMinimap,
		connectPointCalculator: calcRectangleConnectPointPosition,
		createFunction: createRectangleState,
		exportFunction: undefined,
		stateToDataMapper: rectangleStateToData as StateToDataMapper,
	});

	DiagramRegistry.register({
		type: "Ellipse",
		component: Ellipse,
		minimapComponent: EllipseMinimap,
		connectPointCalculator: calcEllipseConnectPointPosition,
		createFunction: createEllipseState,
		exportFunction: undefined,
		stateToDataMapper: ellipseStateToData as StateToDataMapper,
	});

	DiagramRegistry.register({
		type: "Image",
		component: Image,
		minimapComponent: ImageMinimap,
		connectPointCalculator: () => [],
		createFunction: createImageState,
		exportFunction: imageToBlob,
		stateToDataMapper: imageStateToData as StateToDataMapper,
	});

	DiagramRegistry.register({
		type: "Path",
		component: Path,
		minimapComponent: PathMinimap,
		connectPointCalculator: () => [],
		createFunction: createPathState,
		exportFunction: undefined,
		stateToDataMapper: pathStateToData as StateToDataMapper,
	});

	DiagramRegistry.register({
		type: "PathPoint",
		component: PathPoint,
		minimapComponent: PathPointMinimap,
		connectPointCalculator: () => [],
		createFunction: () => undefined,
		exportFunction: undefined,
		stateToDataMapper: pathPointStateToData as StateToDataMapper,
	});

	DiagramRegistry.register({
		type: "Svg",
		component: Svg,
		minimapComponent: SvgMinimap,
		connectPointCalculator: () => [],
		createFunction: () => undefined,
		exportFunction: svgToBlob,
		stateToDataMapper: svgStateToData as StateToDataMapper,
	});

	DiagramRegistry.register({
		type: "ConnectLine",
		component: ConnectLine,
		minimapComponent: ConnectLineMinimap,
		connectPointCalculator: () => [],
		createFunction: () => undefined,
		exportFunction: undefined,
		stateToDataMapper: connectLineStateToData as StateToDataMapper,
	});

	DiagramRegistry.register({
		type: "ConnectPoint",
		component: ConnectPoint,
		minimapComponent: ConnectPointMinimap,
		connectPointCalculator: () => [],
		createFunction: () => undefined,
		exportFunction: undefined,
		stateToDataMapper: connectPointStateToData as StateToDataMapper,
	});

	DiagramRegistry.register({
		type: "Group",
		component: Group,
		minimapComponent: GroupMinimap,
		connectPointCalculator: () => [],
		createFunction: () => undefined,
		exportFunction: undefined,
		stateToDataMapper: groupStateToData as StateToDataMapper,
	});

	// Register node diagrams
	DiagramRegistry.register({
		type: "AgentNode",
		component: AgentNode,
		minimapComponent: AgentNodeMinimap,
		connectPointCalculator: calcRectangleConnectPointPosition,
		createFunction: createAgentNodeData,
		exportFunction: undefined,
		stateToDataMapper: agentNodeStateToData as StateToDataMapper,
	});

	DiagramRegistry.register({
		type: "HubNode",
		component: HubNode,
		minimapComponent: HubNodeMinimap,
		connectPointCalculator: calcEllipseConnectPointPosition,
		createFunction: createHubNodeData,
		exportFunction: undefined,
		stateToDataMapper: hubNodeStateToData as StateToDataMapper,
	});

	DiagramRegistry.register({
		type: "ImageGenNode",
		component: ImageGenNode,
		minimapComponent: ImageGenNodeMinimap,
		connectPointCalculator: calcRectangleConnectPointPosition,
		createFunction: createImageGenNodeData,
		exportFunction: undefined,
		stateToDataMapper: imageGenNodeStateToData as StateToDataMapper,
	});

	DiagramRegistry.register({
		type: "LLMNode",
		component: LLMNode,
		minimapComponent: LLMNodeMinimap,
		connectPointCalculator: calcRectangleConnectPointPosition,
		createFunction: createLLMNodeData,
		exportFunction: undefined,
		stateToDataMapper: llmNodeStateToData as StateToDataMapper,
	});

	DiagramRegistry.register({
		type: "PageDesignNode",
		component: PageDesignNode,
		minimapComponent: PageDesignNodeMinimap,
		connectPointCalculator: calcRectangleConnectPointPosition,
		createFunction: createPageDesignNodeData,
		exportFunction: undefined,
		stateToDataMapper: pageDesignNodeStateToData as StateToDataMapper,
	});

	DiagramRegistry.register({
		type: "SvgToDiagramNode",
		component: SvgToDiagramNode,
		minimapComponent: SvgToDiagramNodeMinimap,
		connectPointCalculator: calcRectangleConnectPointPosition,
		createFunction: createSvgToDiagramNodeData,
		exportFunction: undefined,
		stateToDataMapper: svgToDiagramNodeStateToData as StateToDataMapper,
	});

	DiagramRegistry.register({
		type: "TextAreaNode",
		component: TextAreaNode,
		minimapComponent: TextAreaNodeMinimap,
		connectPointCalculator: calcRectangleConnectPointPosition,
		createFunction: createTextAreaNodeData,
		exportFunction: undefined,
		stateToDataMapper: textAreaNodeStateToData as StateToDataMapper,
	});

	DiagramRegistry.register({
		type: "VectorStoreNode",
		component: VectorStoreNode,
		minimapComponent: VectorStoreNodeMinimap,
		connectPointCalculator: calcRectangleConnectPointPosition,
		createFunction: createVectorStoreNodeData,
		exportFunction: undefined,
		stateToDataMapper: vectorStoreNodeStateToData as StateToDataMapper,
	});

	DiagramRegistry.register({
		type: "WebSearchNode",
		component: WebSearchNode,
		minimapComponent: WebSearchNodeMinimap,
		connectPointCalculator: calcRectangleConnectPointPosition,
		createFunction: createWebSearchNodeData,
		exportFunction: undefined,
		stateToDataMapper: webSearchNodeStateToData as StateToDataMapper,
	});
};
