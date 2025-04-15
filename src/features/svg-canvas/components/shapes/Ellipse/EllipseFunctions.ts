// SvgCanvas関連型定義をインポート
import type { EllipseVertices } from "../../../types/CoordinateTypes";
import type { Diagram } from "../../../types/DiagramCatalog";

// SvgCanvas関連関数をインポート
import { newId } from "../../../utils/Diagram";
import { calcEllipseVertices } from "../../../utils/Math";

// Imports related to this component.
import { DEFAULT_ELLIPSE_DATA } from "./EllipseConstants";
import type { EllipseData } from "./EllipseTypes";

/**
 * 楕円データ作成
 */
export const createEllipseData = ({
	x,
	y,
	width = 100,
	height = 100,
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
	rotation?: number;
	scaleX?: number;
	scaleY?: number;
	keepProportion?: boolean;
	fill?: string;
	stroke?: string;
	strokeWidth?: string;
}): EllipseData => {
	// 接続ポイントを生成
	const vertices = calcEllipseVertices({
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
		const point = vertices[key as keyof EllipseVertices];
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
		...DEFAULT_ELLIPSE_DATA,
		id: newId(),
		x,
		y,
		width,
		height,
		rotation,
		scaleX,
		scaleY,
		keepProportion,
		fill,
		stroke,
		strokeWidth,
		items,
	} as EllipseData;
};
