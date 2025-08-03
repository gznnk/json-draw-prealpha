// Import utils.
import { createRectangleState } from "../../../utils/shapes/rectangle/createRectangleState";
import { createEllipseState } from "../../../utils/shapes/ellipse/createEllipseState";
import { createSvgState } from "../../../utils/shapes/svg/createSvgState";

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
	return createRectangleState({
		x,
		y,
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
	});
};

/**
 * Creates an SVG text element for page design.
 */
export const createPageDesignText = ({
	x,
	y,
	text,
	fontSize,
	fill,
	fontFamily = "Segoe UI",
}: {
	x: number;
	y: number;
	text: string;
	fontSize: number;
	fill: string;
	fontFamily?: string;
}) => {
	// Create a simple SVG text element
	const svgContent = `
		<svg xmlns="http://www.w3.org/2000/svg" width="200" height="50" viewBox="0 0 200 50">
			<text x="10" y="${fontSize + 5}" font-family="${fontFamily}" font-size="${fontSize}" fill="${fill}">
				${text}
			</text>
		</svg>
	`.trim();

	return createSvgState({
		x,
		y,
		width: 200,
		height: 50,
		svgText: svgContent,
	});
};
