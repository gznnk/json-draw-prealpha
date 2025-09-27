import type { ToolDefinition } from "../../../../shared/llm-client/types";

/**
 * Description text for the append_circle_shape tool.
 * Explains the purpose and behavior of the circle shape.
 */
const TOOL_DESCRIPTION = `
Appends a circle shape to a system-prepared dedicated canvas area at the specified center position.
Returns a JSON object containing the shape ID, type, and dimensions.
`;

/**
 * Tool definition for appending a circle shape to a system-prepared canvas area.
 * Conforms to the llm-client ToolDefinition interface.
 */
export const appendCircleShapeToolDefinition: ToolDefinition = {
	name: "append_circle_shape",
	description: TOOL_DESCRIPTION,
	parameters: [
		{
			name: "cx",
			type: "number",
			description: "The X coordinate of the center of the circle.",
		},
		{
			name: "cy",
			type: "number",
			description: "The Y coordinate of the center of the circle.",
		},
		{
			name: "r",
			type: "number",
			description: "The radius of the circle in pixels.",
		},
		{
			name: "fill",
			type: "string",
			description:
				"The fill color of the circle (CSS color format: hex, rgb, named colors).",
		},
		{
			name: "stroke",
			type: "string",
			description:
				"The stroke (border) color of the rectangle  (CSS color format: hex, rgb, named colors). Default is 'transparent'.",
		},
		{
			name: "strokeWidth",
			type: "number",
			description: "The width of the stroke in pixels. Default is 1.",
		},
		{
			name: "name",
			type: "string",
			description: "Optional name for the circle shape.",
		},
		{
			name: "description",
			type: "string",
			description: "Optional description for the circle shape.",
		},
	],
};