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
	createVectorStoreNodeData,
	VectorStoreNode,
} from "../components/nodes/VectorStoreNode";
import {
	createWebSearchNodeData,
	WebSearchNode,
} from "../components/nodes/WebSearchNode";
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
import type { DiagramType } from "./base/DiagramType";

/**
 * Union type representing all diagram data types.
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
 * Dummy component for components that are always wrapped by another component.
 */
const DummyComponent: React.FC = () => null;

/**
 * Maps diagram types to their corresponding React components.
 */
export const DiagramComponentCatalog: {
	// biome-ignore lint/suspicious/noExplicitAny: さまざまな図形の共通の型を作成するのは困難なため
	[key in DiagramType]: () => React.FC<any>;
} = {
	// Shapes
	ConnectLine: () => ConnectLine,
	ConnectPoint: () => DummyComponent,
	Ellipse: () => Ellipse,
	Group: () => Group,
	Image: () => Image,
	Path: () => Path,
	PathPoint: () => PathPoint,
	Rectangle: () => Rectangle,
	Svg: () => Svg,
	// Nodes
	AgentNode: () => AgentNode,
	HubNode: () => HubNode,
	ImageGenNode: () => ImageGenNode,
	SvgToDiagramNode: () => SvgToDiagramNode,
	LLMNode: () => LLMNode,
	TextAreaNode: () => TextAreaNode,
	VectorStoreNode: () => VectorStoreNode,
	WebSearchNode: () => WebSearchNode,
};

/**
 * Maps diagram types to their corresponding connect point calculation functions.
 */
export const DiagramConnectPointCalculators: {
	[key in DiagramType]: (diagram: Diagram) => ConnectPointMoveData[];
} = {
	// Shapes
	ConnectLine: () => [],
	ConnectPoint: () => [],
	Ellipse: (diagram) => calcEllipseConnectPointPosition(diagram),
	Group: () => [],
	Image: () => [],
	Path: () => [],
	PathPoint: () => [],
	Rectangle: (diagram) => calcRectangleConnectPointPosition(diagram),
	Svg: () => [],
	// Nodes
	AgentNode: (diagram) => calcRectangleConnectPointPosition(diagram),
	HubNode: (diagram) => calcEllipseConnectPointPosition(diagram),
	ImageGenNode: (diagram) => calcRectangleConnectPointPosition(diagram),
	SvgToDiagramNode: (diagram) => calcRectangleConnectPointPosition(diagram),
	LLMNode: (diagram) => calcRectangleConnectPointPosition(diagram),
	TextAreaNode: (diagram) => calcRectangleConnectPointPosition(diagram),
	VectorStoreNode: (diagram) => calcRectangleConnectPointPosition(diagram),
	WebSearchNode: (diagram) => calcRectangleConnectPointPosition(diagram),
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
