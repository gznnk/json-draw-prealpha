import { createEllipseData } from "../components/shapes/Ellipse/Ellipse";
import { calcGroupBoxOfNoRotation } from "../components/shapes/Group/Group";
import { createRectangleData } from "../components/shapes/Rectangle/Rectangle";
import { DEFAULT_PATH_DATA } from "../constants/Diagram";
import type {
	Diagram,
	EllipseData,
	GroupData,
	PathData,
	PathPointData,
	RectangleData,
	SelectableData,
	Shape,
	TransformativeData,
} from "../types/DiagramTypes";
import { nanToZero } from "./Math";

/**
 * 新規IDを生成する
 *
 * @returns 新規ID
 */
export const newId = (): string => crypto.randomUUID();

/**
 * 指定されたパラメータからSVGのtransform属性を作成する
 *
 * @param {number} sx - x方向の拡大縮小率
 * @param {number} sy - y方向の拡大縮小率
 * @param {number} theta - 回転角度（ラジアン）
 * @param {number} tx - x方向の平行移動量
 * @param {number} ty - y方向の平行移動量
 * @returns {string} SVGのtransform属性
 */
export const createSvgTransform = (
	sx: number,
	sy: number,
	theta: number,
	tx: number,
	ty: number,
): string => {
	const cosTheta = Math.cos(theta);
	const sinTheta = Math.sin(theta);

	const a = sx * cosTheta;
	const b = sx * sinTheta;
	const c = -sy * sinTheta;
	const d = sy * cosTheta;
	const e = tx;
	const f = ty;

	return `matrix(${a}, ${b}, ${c}, ${d}, ${e}, ${f})`;
};

/**
 * 角度に対応するカーソルを取得する
 *
 * @param angle - 角度
 * @returns - カーソル
 */
export const getCursorFromAngle = (angle: number): string => {
	// angleに360度を加算して0度以上にする
	const _angle = (angle + 360) % 360;

	if (-22.5 <= _angle && _angle < 22.5) {
		return "n-resize";
	}
	if (22.5 <= _angle && _angle < 67.5) {
		return "ne-resize";
	}
	if (67.5 <= _angle && _angle < 112.5) {
		return "e-resize";
	}
	if (112.5 <= _angle && _angle < 157.5) {
		return "se-resize";
	}
	if (157.5 <= _angle && _angle < 202.5) {
		return "s-resize";
	}
	if (202.5 <= _angle && _angle < 247.5) {
		return "sw-resize";
	}
	if (247.5 <= _angle && _angle < 292.5) {
		return "w-resize";
	}
	if (292.5 <= _angle && _angle < 337.5) {
		return "nw-resize";
	}
	return "n-resize";
};

// biome-ignore lint/suspicious/noExplicitAny: 型チェック関数のため
export const isShape = (obj: any): obj is Shape => {
	return (
		obj &&
		typeof obj.x === "number" &&
		typeof obj.y === "number" &&
		typeof obj.width === "number" &&
		typeof obj.height === "number" &&
		typeof obj.rotation === "number" &&
		typeof obj.scaleX === "number" &&
		typeof obj.scaleY === "number"
	);
};

// biome-ignore lint/suspicious/noExplicitAny: 型チェック関数のため
export const isSelectableData = (obj: any): obj is SelectableData => {
	return obj && typeof obj.isSelected === "boolean";
};

// biome-ignore lint/suspicious/noExplicitAny: 型チェック関数のため
export const isItemableData = (obj: any): obj is GroupData => {
	return obj && Array.isArray(obj.items);
};

// biome-ignore lint/suspicious/noExplicitAny: 型チェック関数のため
export const isTransformativeData = (obj: any): obj is TransformativeData => {
	return (
		obj &&
		typeof obj.x === "number" &&
		typeof obj.y === "number" &&
		typeof obj.width === "number" &&
		typeof obj.height === "number" &&
		typeof obj.rotation === "number" &&
		typeof obj.scaleX === "number" &&
		typeof obj.scaleY === "number" &&
		typeof obj.keepProportion === "boolean"
	);
};

/**
 * SVG data string to Diagram data.
 *
 * @param data - SVG data string.
 * @returns  GroupData - Converted diagram data.
 */
export const svgDataToDiagram = (data: string): GroupData => {
	const parser = new DOMParser();
	const svgDoc = parser.parseFromString(data, "image/svg+xml");
	const svgElement = svgDoc.documentElement;
	const newData: Diagram[] = [];
	for (const element of svgElement.children) {
		const tagName = element.tagName;
		try {
			if (tagName === "rect") {
				newData.push(rectElementToDiagram(element as SVGRectElement));
			} else if (tagName === "ellipse") {
				newData.push(ellipseElementToDiagram(element as SVGEllipseElement));
			} else if (tagName === "circle") {
				newData.push(circleElementToDiagram(element as SVGCircleElement));
			} else if (tagName === "line") {
				newData.push(lineElementToDiagram(element as SVGLineElement));
			} else {
				// throw new Error("Unsupported SVG element was found.");
			}
		} catch (e) {
			// Ignore the error and continue processing other elements.
			console.error(e);
		}
	}

	const box = calcGroupBoxOfNoRotation(newData);

	const ret = {
		id: newId(),
		type: "Group",
		x: box.left + nanToZero(box.left + box.right) / 2,
		y: box.top + nanToZero(box.top + box.bottom) / 2,
		width: box.right - box.left,
		height: box.bottom - box.top,
		rotation: 0,
		scaleX: 1,
		scaleY: 1,
		isSelected: false,
		isMultiSelectSource: false,
		items: newData,
	} as GroupData;

	console.log("svgDataToDiagram", ret);

	return ret;
};

/**
 * Converts an SVGRectElement to a RectangleData.
 *
 * @param element - The SVGRectElement to convert.
 * @returns The converted RectangleData.
 */
export const rectElementToDiagram = (
	element: SVGRectElement,
): RectangleData => {
	const x = Number(element.getAttribute("x"));
	const y = Number(element.getAttribute("y"));
	const width = Number(element.getAttribute("width"));
	const height = Number(element.getAttribute("height"));
	if (
		Number.isNaN(x) ||
		Number.isNaN(y) ||
		Number.isNaN(width) ||
		Number.isNaN(height)
	) {
		throw new Error("Unsupported SVGRectElement attribute was found.");
	}

	return createRectangleData({
		x: x + width / 2,
		y: y + height / 2,
		width,
		height,
		fill: element.getAttribute("fill") || "transparent",
		stroke: element.getAttribute("stroke") || "transparent",
		strokeWidth: element.getAttribute("stroke-width") || "0",
	});
};

/**
 * Converts an SVGEllipseElement to a EllipseData.
 *
 * @param element - The SVGEllipseElement to convert.
 * @returns The converted EllipseData.
 */
export const ellipseElementToDiagram = (
	element: SVGEllipseElement,
): EllipseData => {
	const cx = Number(element.getAttribute("cx"));
	const cy = Number(element.getAttribute("cy"));
	const rx = Number(element.getAttribute("rx"));
	const ry = Number(element.getAttribute("ry"));
	if (
		Number.isNaN(cx) ||
		Number.isNaN(cy) ||
		Number.isNaN(rx) ||
		Number.isNaN(ry)
	) {
		throw new Error("Unsupported SVGEllipseElement attribute was found.");
	}

	return createEllipseData({
		x: cx,
		y: cy,
		width: rx * 2,
		height: ry * 2,
		fill: element.getAttribute("fill") || "transparent",
		stroke: element.getAttribute("stroke") || "transparent",
		strokeWidth: element.getAttribute("stroke-width") || "0",
	});
};

/**
 * Converts an SvgCircleElement to a EllipseData.
 *
 * @param element - The SvgCircleElement to convert.
 * @returns The converted EllipseData.
 */
export const circleElementToDiagram = (
	element: SVGCircleElement,
): EllipseData => {
	const cx = Number(element.getAttribute("cx"));
	const cy = Number(element.getAttribute("cy"));
	const r = Number(element.getAttribute("r"));
	if (Number.isNaN(cx) || Number.isNaN(cy) || Number.isNaN(r)) {
		throw new Error("Unsupported SVGCircleElement attribute was found.");
	}

	return createEllipseData({
		x: cx,
		y: cy,
		width: r * 2,
		height: r * 2,
		fill: element.getAttribute("fill") || "transparent",
		stroke: element.getAttribute("stroke") || "transparent",
		strokeWidth: element.getAttribute("stroke-width") || "0",
	});
};

/**
 * Converts an SVGLineElement to a LineData.
 *
 * @param element - The SVGLineElement to convert.
 * @returns The converted LineData.
 */
export const lineElementToDiagram = (element: SVGLineElement): PathData => {
	const x1 = Number(element.getAttribute("x1"));
	const y1 = Number(element.getAttribute("y1"));
	const x2 = Number(element.getAttribute("x2"));
	const y2 = Number(element.getAttribute("y2"));
	if (
		Number.isNaN(x1) ||
		Number.isNaN(y1) ||
		Number.isNaN(x2) ||
		Number.isNaN(y2)
	) {
		throw new Error("Unsupported SVGLineElement attribute was found.");
	}
	return {
		...DEFAULT_PATH_DATA,
		id: newId(),
		type: "Path",
		x: (x1 + x2) / 2,
		y: (y1 + y2) / 2,
		width: Math.abs(x2 - x1),
		height: Math.abs(y2 - y1),
		stroke: element.getAttribute("stroke") || "transparent",
		strokeWidth: element.getAttribute("stroke-width") || "0",
		items: [
			{
				id: newId(),
				type: "PathPoint",
				x: x1,
				y: y1,
				hidden: false,
			},
			{
				id: newId(),
				type: "PathPoint",
				x: x2,
				y: y2,
				hidden: false,
			},
		] as PathPointData[],
	} as PathData;
};
