// Import types related to SvgCanvas.
import type {
	RectangleVertices,
	TextAlign,
	TextableType,
	VerticalAlign,
} from "../../../types/base";
import type { Diagram } from "../../../types/DiagramCatalog";
import type { Shape } from "../../../types";
import type { ConnectPointMoveData } from "../../../types/events";

// Import components related to SvgCanvas.
import type { ConnectPointData } from "../../../types/shapes";

// Import functions related to SvgCanvas.
import {
	newId,
	calcRectangleVertices,
	isConnectableData,
} from "../../../utils";

// Imports related to this component.
import { DEFAULT_RECTANGLE_DATA } from "./RectangleConstants";
import type { RectangleData } from "../../../types/shapes";

/**
 * Calculate the position of the connection points of the ellipse.
 *
 * @param diagram - The diagram data of the ellipse.
 * @returns An array of connection point move data.
 */
export const calcRectangleConnectPointPosition = (
	diagram: Diagram,
): ConnectPointMoveData[] => {
	if (!isConnectableData(diagram)) return []; // Type guard.

	const shape = {
		x: diagram.x,
		y: diagram.y,
		width: diagram.width,
		height: diagram.height,
		rotation: diagram.rotation,
		scaleX: diagram.scaleX,
		scaleY: diagram.scaleY,
	} as Shape;

	// Calculate the vertices of the ellipse.
	const vertices = calcRectangleVertices(diagram as Shape);

	// Create connection point move data.
	const newConnectPoints: ConnectPointMoveData[] = [];
	for (const connectPointData of diagram.connectPoints) {
		const vertex = (vertices as RectangleVertices)[
			connectPointData.name as keyof RectangleVertices
		];

		newConnectPoints.push({
			id: connectPointData.id,
			name: connectPointData.name,
			x: vertex.x,
			y: vertex.y,
			ownerId: diagram.id,
			ownerShape: shape,
		});
	}

	return newConnectPoints;
};

/**
 * Create connection points for a rectangle.
 */
export const createRectangleConnectPoint = ({
	x,
	y,
	width,
	height,
	rotation,
	scaleX,
	scaleY,
}: {
	x: number;
	y: number;
	width: number;
	height: number;
	rotation: number;
	scaleX: number;
	scaleY: number;
}): ConnectPointData[] => {
	const vertices = calcRectangleVertices({
		x,
		y,
		width,
		height,
		rotation,
		scaleX,
		scaleY,
	});

	const connectPoints: ConnectPointData[] = [];
	for (const key of Object.keys(vertices)) {
		const point = vertices[key as keyof RectangleVertices];
		connectPoints.push({
			id: newId(),
			type: "ConnectPoint",
			x: point.x,
			y: point.y,
			name: key,
		});
	}

	return connectPoints;
};

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
	text = "",
	textType = "textarea",
	textAlign = "center",
	verticalAlign = "center",
	fontColor = "black",
	fontSize = 16,
	fontFamily = "Segoe UI",
	fontWeight = "normal",
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
	text?: string;
	textType?: TextableType;
	textAlign?: TextAlign;
	verticalAlign?: VerticalAlign;
	fontColor?: string;
	fontSize?: number;
	fontFamily?: string;
	fontWeight?: string;
}): RectangleData => {
	const connectPoints = createRectangleConnectPoint({
		x,
		y,
		width,
		height,
		rotation,
		scaleX,
		scaleY,
	});

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
		text,
		textType,
		textAlign,
		verticalAlign,
		fontColor,
		fontSize,
		fontFamily,
		fontWeight,
		connectPoints,
	} as RectangleData;
};
