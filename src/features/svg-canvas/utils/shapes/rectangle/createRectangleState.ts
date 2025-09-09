// Import types.
import type { TextAlign } from "../../../types/core/TextAlign";
import type { TextableType } from "../../../types/core/TextableType";
import type { VerticalAlign } from "../../../types/core/VerticalAlign";
import type { RectangleState } from "../../../types/state/shapes/RectangleState";

// Import constants.
import { RectangleDefaultState } from "../../../constants/state/shapes/RectangleDefaultState";

// Import utils.
import { newId } from "../../../utils/shapes/common/newId";
import { createRectangleConnectPoint } from "./createRectangleConnectPoint";

/**
 * Creates rectangle state with the specified properties.
 *
 * @param params - Rectangle parameters including position, size, style and text properties.
 * @returns The created rectangle state object.
 */
export const createRectangleState = ({
	x,
	y,
	width = 100,
	height = 100,
	cornerRadius = 0,
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
	cornerRadius?: number;
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
}): RectangleState => {
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
		...RectangleDefaultState,
		id: newId(),
		x,
		y,
		width,
		height,
		cornerRadius,
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
	} as RectangleState;
};
