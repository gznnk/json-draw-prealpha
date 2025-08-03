// Import types.
import type { TextableType } from "../../../types/core/TextableType";
import type { TextAlign } from "../../../types/core/TextAlign";
import type { VerticalAlign } from "../../../types/core/VerticalAlign";
import type { EllipseState } from "../../../types/state/shapes/EllipseState";

// Import utils.
import { newId } from "../../../utils/shapes/common/newId";

// Import related functions.
import { createEllipseConnectPoint } from "./createEllipseConnectPoint";

// Import constants from Ellipse component.
import { DefaultEllipseState } from "../../../constants/state/shapes/DefaultEllipseState";

/**
 * Creates ellipse state with the specified properties.
 *
 * @param params - Ellipse parameters including position, size, style and text properties.
 * @returns The created ellipse state object.
 */
export const createEllipseState = ({
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
}): EllipseState => {
	// Generate connection points
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
		...DefaultEllipseState,
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
	} as EllipseState;
};