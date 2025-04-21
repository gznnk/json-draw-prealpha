// Import types related to SvgCanvas.
import type { ConnectPointMoveData } from "./EventTypes";

// Import components related to SvgCanvas.
import {
	ConnectLine,
	type ConnectLineData,
} from "../components/shapes/ConnectLine";
import type { ConnectPointData } from "../components/shapes/ConnectPoint";
import {
	Ellipse,
	type EllipseData,
	calcEllipseConnectPointPosition,
	createEllipseData,
} from "../components/shapes/Ellipse";
import { Group, type GroupData } from "../components/shapes/Group";
import {
	createPathData,
	Path,
	PathPoint,
	type PathData,
	type PathPointData,
} from "../components/shapes/Path";
import {
	Rectangle,
	type RectangleData,
	calcRectangleConnectPointPosition,
	createRectangleData,
} from "../components/shapes/Rectangle";
import {
	createTextAreaNodeData,
	TextAreaNode,
} from "../components/nodes/TextAreaNode";
import { createLLMNodeData, LLMNode } from "../components/nodes/LLMNode";
import {
	createSvgToDiagramNodeData,
	SvgToDiagramNode,
} from "../components/nodes/SvgToDiagramNode";
import { Svg, type SvgData } from "../components/shapes/Svg";

/**
 * Types of diagram components.
 */
export type DiagramType =
	// Shapes
	| "ConnectLine"
	| "ConnectPoint"
	| "Ellipse"
	| "Group"
	| "Path"
	| "PathPoint"
	| "Rectangle"
	| "Svg"
	// Nodes
	| "SvgToDiagramNode"
	| "LLMNode"
	| "TextAreaNode";

/**
 * 全図形のデータを統合した型
 */
export type Diagram =
	| ConnectLineData
	| ConnectPointData
	| EllipseData
	| GroupData
	| PathData
	| PathPointData
	| RectangleData
	| SvgData;

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
	Path: Path,
	PathPoint: PathPoint,
	Rectangle: Rectangle,
	Svg: Svg,
	// Nodes
	SvgToDiagramNode: SvgToDiagramNode,
	LLMNode: LLMNode,
	TextAreaNode: TextAreaNode,
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
	Path: () => [],
	PathPoint: () => [],
	Rectangle: calcRectangleConnectPointPosition,
	Svg: () => [],
	// Nodes
	SvgToDiagramNode: calcRectangleConnectPointPosition,
	LLMNode: calcRectangleConnectPointPosition,
	TextAreaNode: calcRectangleConnectPointPosition,
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
	Ellipse: (props) => createEllipseData(props),
	Group: () => undefined,
	Path: (props) => createPathData(props),
	PathPoint: () => undefined,
	Rectangle: (props) => createRectangleData(props),
	Svg: () => undefined,
	// Nodes
	SvgToDiagramNode: (props) => createSvgToDiagramNodeData(props),
	LLMNode: (props) => createLLMNodeData(props),
	TextAreaNode: (props) => createTextAreaNodeData(props),
};
