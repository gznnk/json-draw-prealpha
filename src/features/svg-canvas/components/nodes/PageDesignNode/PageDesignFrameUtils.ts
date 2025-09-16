// Import utils.
import { createRectangleState } from "../../../utils/shapes/rectangle/createRectangleState";
import { createEllipseState } from "../../../utils/shapes/ellipse/createEllipseState";

/**
 * Creates a rectangle frame for page design with specified properties.
 */
export const createPageDesignRectangle = ({
	x,
	y,
	width,
	height,
	fill,
	stroke = "transparent",
	strokeWidth = 1,
	rx = 0,
	text = "",
	textAlign = "center",
	verticalAlign = "center",
	fontColor = "black",
	fontSize = 16,
	fontFamily = "Segoe UI",
	fontWeight = "normal",
}: {
	x: number;
	y: number;
	width: number;
	height: number;
	fill: string;
	stroke?: string;
	strokeWidth?: number;
	rx?: number;
	text?: string;
	textAlign?: "left" | "center" | "right";
	verticalAlign?: "top" | "center" | "bottom";
	fontColor?: string;
	fontSize?: number;
	fontFamily?: string;
	fontWeight?: string;
}) => {
	// Convert top-left coordinates to center coordinates
	const centerX = x + width / 2;
	const centerY = y + height / 2;

	return createRectangleState({
		x: centerX,
		y: centerY,
		width,
		height,
		cornerRadius: rx,
		fill,
		stroke,
		strokeWidth: `${strokeWidth}px`,
		text,
		textType: "textarea",
		textAlign,
		verticalAlign,
		fontColor,
		fontSize,
		fontFamily,
		fontWeight,
		connectEnabled: false,
	});
};;

/**
 * Creates a circle frame for page design with specified properties.
 */
export const createPageDesignCircle = ({
	cx,
	cy,
	r,
	fill,
	stroke = "transparent",
	strokeWidth = 1,
}: {
	cx: number;
	cy: number;
	r: number;
	fill: string;
	stroke?: string;
	strokeWidth?: number;
}) => {
	// cx, cy are now center coordinates of the circle
	return createEllipseState({
		x: cx,
		y: cy,
		width: r * 2,
		height: r * 2,
		fill,
		stroke,
		strokeWidth: `${strokeWidth}px`,
		text: "",
		textType: "textarea",
		connectEnabled: false,
	});
};;

/**
 * Creates a text element for page design using a transparent rectangle with text.
 */
export const createPageDesignText = ({
	x,
	y,
	width,
	height,
	text,
	fontSize,
	fill,
	fontFamily = "Segoe UI",
	textAlign = "center",
	verticalAlign = "center",
}: {
	x: number;
	y: number;
	width: number;
	height: number;
	text: string;
	fontSize: number;
	fill: string;
	fontFamily?: string;
	textAlign?: "left" | "center" | "right";
	verticalAlign?: "top" | "center" | "bottom";
}) => {
	// Convert top-left coordinates to center coordinates
	const centerX = x + width / 2;
	const centerY = y + height / 2;

	return createRectangleState({
		x: centerX,
		y: centerY,
		width,
		height,
		cornerRadius: 0,
		fill: "transparent", // Transparent background for text-only elements
		stroke: "transparent",
		strokeWidth: "0px",
		text,
		textType: "textarea",
		fontSize: fontSize,
		fontFamily,
		fontColor: fill,
		textAlign,
		verticalAlign,
		connectEnabled: false,
	});
};
