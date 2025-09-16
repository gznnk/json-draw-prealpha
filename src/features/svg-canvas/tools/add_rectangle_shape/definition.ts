// Import libraries.
import type { ToolDefinition } from "../../../../shared/llm-client/types";

// Import shared descriptions.
import {
	X_PARAM_DESCRIPTION,
	Y_PARAM_DESCRIPTION,
} from "../shared/descriptions";

/**
 * Description text for the add_rectangle_shape tool.
 * Explains the purpose and behavior of the rectangle shape.
 */
const TOOL_DESCRIPTION = `
Adds a rectangle shape to the canvas at the specified position with optional text content.
This is a simple tool for creating rectangular shapes that can include text.
Returns a JSON object containing the shape ID, type, and dimensions.
`;

/**
 * Tool definition for adding a rectangle shape to the canvas.
 */
export const rectangleShapeToolDefinition: ToolDefinition = {
	name: "add_rectangle_shape",
	description: TOOL_DESCRIPTION,
	parameters: [
		{
			name: "x",
			type: "number",
			description: X_PARAM_DESCRIPTION,
		},
		{
			name: "y",
			type: "number",
			description: Y_PARAM_DESCRIPTION,
		},
		{
			name: "width",
			type: "number",
			description: "The width of the rectangle in pixels.",
		},
		{
			name: "height",
			type: "number",
			description: "The height of the rectangle in pixels.",
		},
		{
			name: "fill",
			type: "string",
			description:
				"The fill color of the rectangle (CSS color format: hex, rgb, named colors).",
		},
		{
			name: "stroke",
			type: "string",
			description:
				"The stroke (border) color of the rectangle. Default is 'transparent'.",
		},
		{
			name: "strokeWidth",
			type: "number",
			description: "The width of the stroke in pixels. Default is 1.",
		},
		{
			name: "rx",
			type: "number",
			description:
				"The corner radius for rounded rectangles. Default is 0 (sharp corners).",
		},
		{
			name: "text",
			type: "string",
			description: "Optional text content to display inside the rectangle.",
		},
		{
			name: "textAlign",
			type: "string",
			description:
				"Text horizontal alignment: 'left', 'center', or 'right'. Default is 'center'.",
			enum: ["left", "center", "right"],
		},
		{
			name: "verticalAlign",
			type: "string",
			description:
				"Text vertical alignment: 'top', 'center', or 'bottom'. Default is 'center'.",
			enum: ["top", "center", "bottom"],
		},
		{
			name: "fontColor",
			type: "string",
			description: "Color of the text (CSS color format). Default is 'black'.",
		},
		{
			name: "fontSize",
			type: "number",
			description: "Font size of the text in pixels. Default is 16.",
		},
		{
			name: "fontFamily",
			type: "string",
			description: "Font family for the text. Default is 'Segoe UI'.",
		},
		{
			name: "fontWeight",
			type: "string",
			description:
				"Font weight for the text (e.g., 'normal', 'bold'). Default is 'normal'.",
		},
	],
};
