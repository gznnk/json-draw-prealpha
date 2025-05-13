// Import types.
import type {
	EllipseData,
	TextAlign,
	TextableType,
	VerticalAlign,
} from "../../../types";

// Import utils.
import { newId } from "../../../utils";

// Import related functions.
import { createEllipseConnectPoint } from "./createEllipseConnectPoint";

// Import constants from Ellipse component.
import { DEFAULT_ELLIPSE_DATA } from "../../../components/shapes/Ellipse/EllipseConstants";

/**
 * Creates ellipse data with the specified properties.
 *
 * @param params - Ellipse parameters including position, size, style and text properties.
 * @returns The created ellipse data object.
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
}): EllipseData => {
	// 接続ポイントを生成
	const connectPoints = createEllipseConnectPoint({
		x,
		y,
		width,
		height,
		rotation,
		scaleX,
		scaleY,
	});

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
		text,
		textType,
		textAlign,
		verticalAlign,
		fontColor,
		fontSize,
		fontFamily,
		fontWeight,
		connectPoints,
	} as EllipseData;
};
