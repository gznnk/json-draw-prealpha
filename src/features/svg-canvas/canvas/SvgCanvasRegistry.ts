// Import registry
import { DiagramRegistry } from "../registry";
import type {
	DataToStateMapper,
	StateToDataMapper,
} from "../registry/DiagramDefinition";

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
import { ConnectLineMinimap } from "../components/shapes/ConnectLine";
import { ConnectPointMinimap } from "../components/shapes/ConnectPoint/ConnectPointMinimap";
import { EllipseMinimap } from "../components/shapes/Ellipse/EllipseMinimap";
import { GroupMinimap } from "../components/shapes/Group/GroupMinimap";
import { ImageMinimap } from "../components/shapes/Image/ImageMinimap";
import { PathMinimap } from "../components/shapes/Path";
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
import { createAgentNodeState } from "../utils/nodes/agentNode/createAgentNodeState";
import { createHubNodeState } from "../utils/nodes/hubNode/createHubNodeState";
import { createImageGenNodeState } from "../utils/nodes/imageGenNode/createImageGenNodeState";
import { createLLMNodeState } from "../utils/nodes/llmNodeData/createLLMNodeState";
import { createPageDesignNodeState } from "../utils/nodes/pageDesignNode/createPageDesignNodeState";
import { createSvgToDiagramNodeState } from "../utils/nodes/svgToDiagramNode/createSvgToDiagramNodeState";
import { createTextAreaNodeState } from "../utils/nodes/textAreaNode/createTextAreaNodeState";
import { createVectorStoreNodeState } from "../utils/nodes/vectorStoreNode/createVectorStoreNodeState";
import { createWebSearchNodeState } from "../utils/nodes/webSearchNode/createWebSearchNodeState";
import { createEllipseState } from "../utils/shapes/ellipse/createEllipseState";
import { createImageState } from "../utils/shapes/image/createImageState";
import { createPathState } from "../utils/shapes/path/createPathState";
import { createRectangleState } from "../utils/shapes/rectangle/createRectangleState";

// Import export functions
import { imageToBlob } from "../utils/shapes/image/imageToBlob";
import { svgToBlob } from "../utils/shapes/svg/svgToBlob";

// Import state to data mapping functions
import { agentNodeStateToData } from "../utils/nodes/agentNode/mapAgentNodeStateToData";
import { hubNodeStateToData } from "../utils/nodes/hubNode/mapHubNodeStateToData";
import { imageGenNodeStateToData } from "../utils/nodes/imageGenNode/mapImageGenNodeStateToData";
import { llmNodeStateToData } from "../utils/nodes/llmNodeData/mapLLMNodeStateToData";
import { pageDesignNodeStateToData } from "../utils/nodes/pageDesignNode/mapPageDesignNodeStateToData";
import { svgToDiagramNodeStateToData } from "../utils/nodes/svgToDiagramNode/mapSvgToDiagramNodeStateToData";
import { textAreaNodeStateToData } from "../utils/nodes/textAreaNode/mapTextAreaNodeStateToData";
import { vectorStoreNodeStateToData } from "../utils/nodes/vectorStoreNode/mapVectorStoreNodeStateToData";
import { webSearchNodeStateToData } from "../utils/nodes/webSearchNode/mapWebSearchNodeStateToData";
import { connectLineStateToData } from "../utils/shapes/connectLine/mapConnectLineStateToData";
import { connectPointStateToData } from "../utils/shapes/connectPoint/mapConnectPointStateToData";
import { ellipseStateToData } from "../utils/shapes/ellipse/mapEllipseStateToData";
import { groupStateToData } from "../utils/shapes/group/mapGroupStateToData";
import { imageStateToData } from "../utils/shapes/image/mapImageStateToData";
import { pathPointStateToData } from "../utils/shapes/path/mapPathPointStateToData";
import { pathStateToData } from "../utils/shapes/path/mapPathStateToData";
import { rectangleStateToData } from "../utils/shapes/rectangle/mapRectangleStateToData";
import { svgStateToData } from "../utils/shapes/svg/mapSvgStateToData";

// Import data to state mapping functions
import { mapAgentNodeDataToState } from "../utils/nodes/agentNode/mapAgentNodeDataToState";
import { mapHubNodeDataToState } from "../utils/nodes/hubNode/mapHubNodeDataToState";
import { mapImageGenNodeDataToState } from "../utils/nodes/imageGenNode/mapImageGenNodeDataToState";
import { mapLLMNodeDataToState } from "../utils/nodes/llmNodeData/mapLLMNodeDataToState";
import { mapPageDesignNodeDataToState } from "../utils/nodes/pageDesignNode/mapPageDesignNodeDataToState";
import { mapSvgToDiagramNodeDataToState } from "../utils/nodes/svgToDiagramNode/mapSvgToDiagramNodeDataToState";
import { mapTextAreaNodeDataToState } from "../utils/nodes/textAreaNode/mapTextAreaNodeDataToState";
import { mapVectorStoreNodeDataToState } from "../utils/nodes/vectorStoreNode/mapVectorStoreNodeDataToState";
import { mapWebSearchNodeDataToState } from "../utils/nodes/webSearchNode/mapWebSearchNodeDataToState";
import { mapConnectLineDataToState } from "../utils/shapes/connectLine/mapConnectLineDataToState";
import { mapConnectPointDataToState } from "../utils/shapes/connectPoint/mapConnectPointDataToState";
import { mapEllipseDataToState } from "../utils/shapes/ellipse/mapEllipseDataToState";
import { mapGroupDataToState } from "../utils/shapes/group/mapGroupDataToState";
import { mapImageDataToState } from "../utils/shapes/image/mapImageDataToState";
import { mapPathDataToState } from "../utils/shapes/path/mapPathDataToState";
import { mapPathPointDataToState } from "../utils/shapes/path/mapPathPointDataToState";
import { mapRectangleDataToState } from "../utils/shapes/rectangle/mapRectangleDataToState";
import { mapSvgDataToState } from "../utils/shapes/svg/mapSvgDataToState";

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
		dataToStateMapper: mapRectangleDataToState as DataToStateMapper,
	});

	DiagramRegistry.register({
		type: "Ellipse",
		component: Ellipse,
		minimapComponent: EllipseMinimap,
		connectPointCalculator: calcEllipseConnectPointPosition,
		createFunction: createEllipseState,
		exportFunction: undefined,
		stateToDataMapper: ellipseStateToData as StateToDataMapper,
		dataToStateMapper: mapEllipseDataToState as DataToStateMapper,
	});

	DiagramRegistry.register({
		type: "Image",
		component: Image,
		minimapComponent: ImageMinimap,
		connectPointCalculator: () => [],
		createFunction: createImageState,
		exportFunction: imageToBlob,
		stateToDataMapper: imageStateToData as StateToDataMapper,
		dataToStateMapper: mapImageDataToState as DataToStateMapper,
	});

	DiagramRegistry.register({
		type: "Path",
		component: Path,
		minimapComponent: PathMinimap,
		connectPointCalculator: () => [],
		createFunction: createPathState,
		exportFunction: undefined,
		stateToDataMapper: pathStateToData as StateToDataMapper,
		dataToStateMapper: mapPathDataToState as DataToStateMapper,
	});

	DiagramRegistry.register({
		type: "PathPoint",
		component: PathPoint,
		minimapComponent: PathPointMinimap,
		connectPointCalculator: () => [],
		createFunction: () => undefined,
		exportFunction: undefined,
		stateToDataMapper: pathPointStateToData as StateToDataMapper,
		dataToStateMapper: mapPathPointDataToState as DataToStateMapper,
	});

	DiagramRegistry.register({
		type: "Svg",
		component: Svg,
		minimapComponent: SvgMinimap,
		connectPointCalculator: () => [],
		createFunction: () => undefined,
		exportFunction: svgToBlob,
		stateToDataMapper: svgStateToData as StateToDataMapper,
		dataToStateMapper: mapSvgDataToState as DataToStateMapper,
	});

	DiagramRegistry.register({
		type: "ConnectLine",
		component: ConnectLine,
		minimapComponent: ConnectLineMinimap,
		connectPointCalculator: () => [],
		createFunction: () => undefined,
		exportFunction: undefined,
		stateToDataMapper: connectLineStateToData as StateToDataMapper,
		dataToStateMapper: mapConnectLineDataToState as DataToStateMapper,
	});

	DiagramRegistry.register({
		type: "ConnectPoint",
		component: ConnectPoint,
		minimapComponent: ConnectPointMinimap,
		connectPointCalculator: () => [],
		createFunction: () => undefined,
		exportFunction: undefined,
		stateToDataMapper: connectPointStateToData as StateToDataMapper,
		dataToStateMapper: mapConnectPointDataToState as DataToStateMapper,
	});

	DiagramRegistry.register({
		type: "Group",
		component: Group,
		minimapComponent: GroupMinimap,
		connectPointCalculator: () => [],
		createFunction: () => undefined,
		exportFunction: undefined,
		stateToDataMapper: groupStateToData as StateToDataMapper,
		dataToStateMapper: mapGroupDataToState as DataToStateMapper,
	});

	// Register node diagrams
	DiagramRegistry.register({
		type: "AgentNode",
		component: AgentNode,
		minimapComponent: AgentNodeMinimap,
		connectPointCalculator: calcRectangleConnectPointPosition,
		createFunction: createAgentNodeState,
		exportFunction: undefined,
		stateToDataMapper: agentNodeStateToData as StateToDataMapper,
		dataToStateMapper: mapAgentNodeDataToState as DataToStateMapper,
	});

	DiagramRegistry.register({
		type: "HubNode",
		component: HubNode,
		minimapComponent: HubNodeMinimap,
		connectPointCalculator: calcEllipseConnectPointPosition,
		createFunction: createHubNodeState,
		exportFunction: undefined,
		stateToDataMapper: hubNodeStateToData as StateToDataMapper,
		dataToStateMapper: mapHubNodeDataToState as DataToStateMapper,
	});

	DiagramRegistry.register({
		type: "ImageGenNode",
		component: ImageGenNode,
		minimapComponent: ImageGenNodeMinimap,
		connectPointCalculator: calcRectangleConnectPointPosition,
		createFunction: createImageGenNodeState,
		exportFunction: undefined,
		stateToDataMapper: imageGenNodeStateToData as StateToDataMapper,
		dataToStateMapper: mapImageGenNodeDataToState as DataToStateMapper,
	});

	DiagramRegistry.register({
		type: "LLMNode",
		component: LLMNode,
		minimapComponent: LLMNodeMinimap,
		connectPointCalculator: calcRectangleConnectPointPosition,
		createFunction: createLLMNodeState,
		exportFunction: undefined,
		stateToDataMapper: llmNodeStateToData as StateToDataMapper,
		dataToStateMapper: mapLLMNodeDataToState as DataToStateMapper,
	});

	DiagramRegistry.register({
		type: "PageDesignNode",
		component: PageDesignNode,
		minimapComponent: PageDesignNodeMinimap,
		connectPointCalculator: calcRectangleConnectPointPosition,
		createFunction: createPageDesignNodeState,
		exportFunction: undefined,
		stateToDataMapper: pageDesignNodeStateToData as StateToDataMapper,
		dataToStateMapper: mapPageDesignNodeDataToState as DataToStateMapper,
	});

	DiagramRegistry.register({
		type: "SvgToDiagramNode",
		component: SvgToDiagramNode,
		minimapComponent: SvgToDiagramNodeMinimap,
		connectPointCalculator: calcRectangleConnectPointPosition,
		createFunction: createSvgToDiagramNodeState,
		exportFunction: undefined,
		stateToDataMapper: svgToDiagramNodeStateToData as StateToDataMapper,
		dataToStateMapper: mapSvgToDiagramNodeDataToState as DataToStateMapper,
	});

	DiagramRegistry.register({
		type: "TextAreaNode",
		component: TextAreaNode,
		minimapComponent: TextAreaNodeMinimap,
		connectPointCalculator: calcRectangleConnectPointPosition,
		createFunction: createTextAreaNodeState,
		exportFunction: undefined,
		stateToDataMapper: textAreaNodeStateToData as StateToDataMapper,
		dataToStateMapper: mapTextAreaNodeDataToState as DataToStateMapper,
	});

	DiagramRegistry.register({
		type: "VectorStoreNode",
		component: VectorStoreNode,
		minimapComponent: VectorStoreNodeMinimap,
		connectPointCalculator: calcRectangleConnectPointPosition,
		createFunction: createVectorStoreNodeState,
		exportFunction: undefined,
		stateToDataMapper: vectorStoreNodeStateToData as StateToDataMapper,
		dataToStateMapper: mapVectorStoreNodeDataToState as DataToStateMapper,
	});

	DiagramRegistry.register({
		type: "WebSearchNode",
		component: WebSearchNode,
		minimapComponent: WebSearchNodeMinimap,
		connectPointCalculator: calcRectangleConnectPointPosition,
		createFunction: createWebSearchNodeState,
		exportFunction: undefined,
		stateToDataMapper: webSearchNodeStateToData as StateToDataMapper,
		dataToStateMapper: mapWebSearchNodeDataToState as DataToStateMapper,
	});
};
