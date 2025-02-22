// 図形に関する型定義

import type { Point } from "./CoordinateTypes";
import type { ParentDiagramResizeEvent } from "./EventTypes";

/**
 * 図形の種類
 */
export type DiagramType = "group" | "rectangle" | "ellipse";

/**
 * 子コンポーネントの図形への参照
 */
export type DiagramRef = {
	svgRef?: React.RefObject<SVGGElement>;
	draggableRef?: React.RefObject<SVGGElement>;
	onParentDiagramResize?: (e: ParentDiagramResizeEvent) => void;
	onParentDiagramResizeEnd?: (e: ParentDiagramResizeEvent) => void;
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
