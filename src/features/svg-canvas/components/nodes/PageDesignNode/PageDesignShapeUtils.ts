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
};;

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
};;

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
	// Convert top-left coordinates to center coordinates
	// Estimate text dimensions for center calculation
	const estimatedWidth = text.length * fontSize * 0.6; // Rough estimation
	const estimatedHeight = fontSize * 1.2;
	const centerX = x + estimatedWidth / 2;
	const centerY = y + estimatedHeight / 2;
	
	// Create a simple SVG text element
	const svgContent = `
		<svg xmlns="http://www.w3.org/2000/svg" width="${Math.max(estimatedWidth, 200)}" height="${Math.max(estimatedHeight, 50)}" viewBox="0 0 ${Math.max(estimatedWidth, 200)} ${Math.max(estimatedHeight, 50)}">
			<text x="10" y="${fontSize + 5}" font-family="${fontFamily}" font-size="${fontSize}" fill="${fill}">
				${text}
			</text>
		</svg>
	`.trim();

	return createSvgState({
		x: centerX,
		y: centerY,
		width: Math.max(estimatedWidth, 200),
		height: Math.max(estimatedHeight, 50),
		svgText: svgContent,
	});
};;
