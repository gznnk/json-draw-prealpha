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
} from "../components/shapes/Ellipse";
import { Group, type GroupData } from "../components/shapes/Group";
import {
	Path,
	PathPoint,
	type PathData,
	type PathPointData,
} from "../components/shapes/Path";
import {
	Rectangle,
	type RectangleData,
	calcRectangleConnectPointPosition,
} from "../components/shapes/Rectangle";
import { TextAreaNode } from "../components/nodes/TextAreaNode";
import { LLMNode } from "../components/nodes/LLMNode";

/**
 * 図形の種類
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
	// Nodes
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
	| RectangleData;

/**
 * ダミー図形コンポーネント
 */
const DummyComponent: React.FC = () => null;

/**
 * 図形の種類とコンポーネントのマッピング
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
	// Nodes
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
	// Nodes
	LLMNode: calcEllipseConnectPointPosition,
	TextAreaNode: calcRectangleConnectPointPosition,
};
