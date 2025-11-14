import type { ToolDefinition } from "../../../../shared/llm-client/types";

/**
 * Description text for the add_path_shape tool.
 * Explains the purpose and behavior of the path shape.
 */
const TOOL_DESCRIPTION = `
Adds a path shape to the canvas.
A path is a line composed of multiple points that can be edited to create custom shapes and lines.
You can specify custom points to define the exact shape of the path, or it will default to two points.
Returns a JSON object containing the shape ID, type, and dimensions (width and height).
`;

/**
 * Tool definition for adding a path shape to the canvas.
 * Conforms to the llm-client ToolDefinition interface.
 */
export const pathShapeToolDefinition: ToolDefinition = {
	name: "add_path_shape",
	description: TOOL_DESCRIPTION,
	parameters: [
		{
			name: "x",
			type: "number",
			description:
				"The X coordinate of the center of the path on the canvas. Used as reference point when points are not specified.",
		},
		{
			name: "y",
			type: "number",
			description:
				"The Y coordinate of the center of the path on the canvas. Used as reference point when points are not specified.",
		},
		{
			name: "points",
			type: "array",
			description:
				"Array of points defining the path. Each point should have x and y coordinates. Example: [{x: 100, y: 100}, {x: 200, y: 150}, {x: 300, y: 100}]",
			items: {
				type: "object",
				properties: {
					x: { type: "number", description: "X coordinate of the point" },
					y: { type: "number", description: "Y coordinate of the point" },
				},
			},
		},
		{
			name: "stroke",
			type: "string",
			description:
				"The stroke color of the path (e.g., 'black', '#FF0000', 'rgb(255, 0, 0)'). Default is 'black'.",
		},
		{
			name: "strokeWidth",
			type: "number",
			description: "The width of the path stroke in pixels. Default is 1.",
		},
	],
};
