// 図形に関する型定義

// SvgCanvas関連型定義をインポート
import type { Point } from "./CoordinateTypes";
import type {
	DiagramClickEvent,
	DiagramDragEvent,
	DiagramResizeEvent,
	DiagramSelectEvent,
	GroupDragEvent,
	GroupResizeEvent,
} from "./EventTypes";

// SvgCanvas関連コンポーネントをインポート
import Ellipse from "../components/diagram/Ellipse";
import Group from "../components/diagram/Group";
import Rectangle from "../components/diagram/Rectangle";

/**
 * 図形の種類
 */
export type DiagramType = "group" | "rectangle" | "ellipse";

/**
 * グループ内の図形への参照
 */
export type DiagramRef = {
	onGroupDrag?: (e: GroupDragEvent) => void;
	onGroupDragEnd?: (e: GroupDragEvent) => void;
	onGroupResize?: (e: GroupResizeEvent) => void;
	onGroupResizeEnd?: (e: GroupResizeEvent) => void;
};

// TODO: 精査
export type Diagram = {
	id: string;
	type: DiagramType;
	point: Point;
	width: number;
	height: number;
	fill: string;
	stroke: string;
	strokeWidth: string;
	keepProportion: boolean;
	isSelected: boolean;
	items?: Diagram[];
};

export type DiagramProps = Diagram & {
	onDiagramClick?: (e: DiagramClickEvent) => void;
	onDiagramDragStart?: (e: DiagramDragEvent) => void;
	onDiagramDrag?: (e: DiagramDragEvent) => void;
	onDiagramDragEnd?: (e: DiagramDragEvent) => void;
	onDiagramResizeStart?: (e: DiagramResizeEvent) => void;
	onDiagramResizing?: (e: DiagramResizeEvent) => void;
	onDiagramResizeEnd?: (e: DiagramResizeEvent) => void;
	onDiagramSelect?: (e: DiagramSelectEvent) => void;
	// ref?: React.Ref<DiagramRef>;
};

/**
 * 図形の種類とコンポーネントのマッピング
 */
export const DiagramTypeComponentMap: {
	[key in DiagramType]: React.FC<DiagramProps>;
} = {
	group: Group,
	rectangle: Rectangle,
	ellipse: Ellipse,
};
