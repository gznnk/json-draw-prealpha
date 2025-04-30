// Import types related to SvgCanvas.
import type { ConnectPointMoveData } from "./EventTypes";

// Import components related to SvgCanvas.
import { AgentNode, createAgentNodeData } from "../components/nodes/AgentNode";
import {
	createHubNodeData,
	HubNode,
	type HubNodeData,
} from "../components/nodes/HubNode";
import {
	createImageGenNodeData,
	ImageGenNode,
} from "../components/nodes/ImageGenNode";
import { createLLMNodeData, LLMNode } from "../components/nodes/LLMNode";
import {
	createSvgToDiagramNodeData,
	SvgToDiagramNode,
} from "../components/nodes/SvgToDiagramNode";
import {
	createTextAreaNodeData,
	TextAreaNode,
} from "../components/nodes/TextAreaNode";
import {
	ConnectLine,
	type ConnectLineData,
} from "../components/shapes/ConnectLine";
import type { ConnectPointData } from "../components/shapes/ConnectPoint";
import {
	calcEllipseConnectPointPosition,
	createEllipseData,
	Ellipse,
	type EllipseData,
} from "../components/shapes/Ellipse";
import { Group, type GroupData } from "../components/shapes/Group";
import {
	createImageData,
	Image,
	imageToBlob,
	type ImageData,
} from "../components/shapes/Image";
import {
	createPathData,
	Path,
	PathPoint,
	type PathData,
	type PathPointData,
} from "../components/shapes/Path";
import {
	calcRectangleConnectPointPosition,
	createRectangleData,
	Rectangle,
	type RectangleData,
} from "../components/shapes/Rectangle";
import { Svg, svgToBlob, type SvgData } from "../components/shapes/Svg";
import {
	createWebSearchNodeData,
	WebSearchNode,
} from "../components/nodes/WebSearchNode";

/**
 * Types of diagram components.
 */
export type DiagramType =
	// Shapes
	| "ConnectLine"
	| "ConnectPoint"
	| "Ellipse"
	| "Group"
	| "Image"
	| "Path"
	| "PathPoint"
	| "Rectangle"
	| "Svg"
	// Nodes
	| "AgentNode"
	| "HubNode"
	| "ImageGenNode"
	| "SvgToDiagramNode"
	| "LLMNode"
	| "TextAreaNode"
	| "WebSearchNode";

/**
 * 全図形のデータを統合した型
 */
export type Diagram =
	// Shapes
	| ConnectLineData
	| ConnectPointData
	| EllipseData
	| GroupData
	| ImageData
	| PathData
	| PathPointData
	| RectangleData
	| SvgData
	// Nodes
	| HubNodeData;

/**
 * Dummy component. This is used by components that are always wrapped by another component.
 */
const DummyComponent: React.FC = () => null;

/**
 * The mapping of diagram types to their corresponding React components.
 */
export const DiagramComponentCatalog: {
	// biome-ignore lint/suspicious/noExplicitAny: 種々の図形の共通の型を作るのは困難なため
	[key in DiagramType]: React.FC<any>;
} = {
	// Shapes
	ConnectLine: ConnectLine,
	ConnectPoint: DummyComponent,
	Ellipse: Ellipse,
	Group: Group,
	Image: Image,
	Path: Path,
	PathPoint: PathPoint,
	Rectangle: Rectangle,
	Svg: Svg,
	// Nodes
	AgentNode: AgentNode,
	HubNode: HubNode,
	ImageGenNode: ImageGenNode,
	SvgToDiagramNode: SvgToDiagramNode,
	LLMNode: LLMNode,
	TextAreaNode: TextAreaNode,
	WebSearchNode: WebSearchNode,
};

/**
 * ConnectPoint position calculator for each diagram type.
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
	WebSearchNode: calcRectangleConnectPointPosition,
};

/**
 * Mapping of diagram types to their corresponding data creation functions.
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
	WebSearchNode: createWebSearchNodeData,
};

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
	WebSearchNode: undefined,
};
