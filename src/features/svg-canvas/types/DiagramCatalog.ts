// SvgCanvas関連コンポーネントをインポート
import {
	ConnectLine,
	type ConnectLineData,
} from "../components/shapes/ConnectLine";
import type { ConnectPointData } from "../components/shapes/ConnectPoint";
import { Ellipse, type EllipseData } from "../components/shapes/Ellipse";
import { Group, type GroupData } from "../components/shapes/Group";
import {
	Path,
	PathPoint,
	type PathData,
	type PathPointData,
} from "../components/shapes/Path";
import { Rectangle, type RectangleData } from "../components/shapes/Rectangle";

/**
 * 図形の種類
 */
export type DiagramType =
	| "ConnectLine"
	| "ConnectPoint"
	| "Ellipse"
	| "Group"
	| "Path"
	| "PathPoint"
	| "Rectangle";

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
	ConnectLine: ConnectLine,
	ConnectPoint: DummyComponent,
	Ellipse: Ellipse,
	Group: Group,
	Path: Path,
	PathPoint: PathPoint,
	Rectangle: Rectangle,
};
