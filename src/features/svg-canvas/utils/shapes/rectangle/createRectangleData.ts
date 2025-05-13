// Import types related to SvgCanvas.
import type {
	TextAlign,
	TextableType,
	VerticalAlign,
} from "../../../types/base";
import type { RectangleData } from "../../../types/data";

// Import functions related to SvgCanvas.
import { newId } from "../../../utils";

// Import related functions.
import { createRectangleConnectPoint } from "./createRectangleConnectPoint";

// Import constants from Rectangle component.
import { DEFAULT_RECTANGLE_DATA } from "../../../components/shapes/Rectangle/RectangleConstants";

/**
 * Creates rectangle data with the specified properties.
 *
 * @param params - Rectangle parameters including position, size, style and text properties.
 * @returns The created rectangle data object.
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
