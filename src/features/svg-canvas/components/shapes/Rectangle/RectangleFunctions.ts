// SvgCanvas関連型定義をインポート
import type { RectangleVertices } from "../../../types/CoordinateTypes";
import type { Diagram } from "../../../types/DiagramCatalog";

// SvgCanvas関連関数をインポート
import { newId } from "../../../utils/Diagram";
import { calcRectangleVertices } from "../../../utils/Math";

// Imports related to this component.
import { DEFAULT_RECTANGLE_DATA } from "./RectangleConstants";
import type { RectangleData } from "./RectangleTypes";

/**
 * 四角形データ作成
 */
export const createRectangleData = ({
	x,
	y,
	width = 100,
	height = 100,
	radius = 0,
	rotation = 0,
	scaleX = 1,
	scaleY = 1,
	keepProportion = false,
	fill = "transparent",
	stroke = "black",
	strokeWidth = "1px",
}: {
	x: number;
	y: number;
	width?: number;
	height?: number;
	radius?: number;
	rotation?: number;
	scaleX?: number;
	scaleY?: number;
	keepProportion?: boolean;
	fill?: string;
	stroke?: string;
	strokeWidth?: string;
}): RectangleData => {
	// 接続ポイントを生成
	const vertices = calcRectangleVertices({
		x,
		y,
		width,
		height,
		rotation,
		scaleX,
		scaleY,
	});

	const items: Diagram[] = [];
	for (const key of Object.keys(vertices)) {
		const point = vertices[key as keyof RectangleVertices];
		items.push({
			id: newId(),
			type: "ConnectPoint",
			x: point.x,
			y: point.y,
			isSelected: false,
			name: key,
		});
	}

	return {
		...DEFAULT_RECTANGLE_DATA,
		id: newId(),
		x,
		y,
		width,
		height,
		radius,
		rotation,
		scaleX,
		scaleY,
		keepProportion,
		fill,
		stroke,
		strokeWidth,
		items,
	} as RectangleData;
};
