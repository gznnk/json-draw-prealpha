// Import utils.
import { createRectangleState } from "../../../utils/shapes/rectangle/createRectangleState";
import { createEllipseState } from "../../../utils/shapes/ellipse/createEllipseState";

/**
 * Creates a rectangle shape for page design with specified properties.
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
}: {
	x: number;
	y: number;
	width: number;
	height: number;
	fill: string;
	stroke?: string;
	strokeWidth?: number;
	rx?: number;
}) => {
	// Convert top-left coordinates to center coordinates
	const centerX = x + width / 2;
	const centerY = y + height / 2;

	return createRectangleState({
		x: centerX,
		y: centerY,
		width,
		height,
		radius: rx,
		fill,
		stroke,
		strokeWidth: `${strokeWidth}px`,
		text: "",
		textType: "textarea",
	});
};

/**
 * Creates a circle shape for page design with specified properties.
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
	// Convert top-left coordinates to center coordinates
	// cx, cy are now top-left coordinates of the circle's bounding box
	const centerX = cx + r;
	const centerY = cy + r;

	return createEllipseState({
		x: centerX,
		y: centerY,
		width: r * 2,
		height: r * 2,
		fill,
		stroke,
		strokeWidth: `${strokeWidth}px`,
		text: "",
		textType: "textarea",
	});
};

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
		radius: 0,
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
	});
};;
