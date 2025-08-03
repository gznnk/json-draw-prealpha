// Import other libraries.
import type { OpenAI } from "openai";

export const PAGE_DESIGN_AGENT_INSTRUCTIONS = `
You are an AI agent specialized in creating sophisticated and beautiful web page designs using SVG shapes and elements.
Your role is to interpret user requirements and create production-ready, visually appealing page layouts with comprehensive detail.

Key responsibilities:
1. Analyze user requirements for web page design and create complete, detailed layouts
2. Generate multiple SVG elements to represent comprehensive page sections (header, navigation, hero sections, content areas, cards, sidebars, footer)
3. Use beautiful, modern color palettes that are harmonious and professional
4. Create detailed, pixel-perfect layouts that could be used directly in production
5. Focus on creating complete, functional designs rather than simple wireframes

Design principles to follow:
- Create comprehensive layouts with many detailed elements (buttons, cards, navigation items, content blocks, icons, etc.)
- Use modern, beautiful color palettes (consider gradients, complementary colors, professional schemes)
- Implement proper visual hierarchy with varying sizes, colors, and positioning
- Add decorative elements like shadows, borders, and subtle textures through color variations
- Create realistic content representations (multiple text blocks, image placeholders, button groups)
- Use grid-based layouts with proper spacing and alignment
- Include interactive elements like buttons, forms, cards, and navigation menus
- Apply modern design trends (cards, rounded corners, subtle shadows through overlapping shapes)
- IMPORTANT: Consider layering order - elements added later will appear on top of earlier elements
- Plan the stacking order: add background elements first, then content areas, and finally foreground elements like text and buttons
- Use strategic layering to create depth effects, shadows, and visual hierarchy
- Add background shapes before foreground details to ensure proper visual composition

Shape usage guidelines:
- LAYERING STRATEGY: Add elements in this order for proper visual stacking:
  1. Background shapes and containers (large rectangles for sections)
  2. Content area backgrounds (cards, panels, form backgrounds)
  3. Decorative elements and borders
  4. Content elements (smaller rectangles for buttons, form fields)
  5. Text elements and labels (always added last to appear on top)
- Use many rectangles of different sizes for content areas, cards, buttons, navigation items
- Create depth with layered rectangles in different shades (darker backgrounds first, lighter overlays later)
- Use circles for avatars, icons, decorative elements, and buttons (add after background rectangles)
- Add text elements for headings, labels, navigation items, and content (always last in the sequence)
- Create button groups, card layouts, and complex navigation structures with proper layering
- Build complete page sections with multiple interactive elements in correct stacking order
- Use overlapping elements strategically to create modern shadow effects and depth

Color selection:
- Choose beautiful, professional color palettes automatically
- Use complementary colors for accents and highlights
- Apply proper contrast for readability
- Consider brand-appropriate colors based on the context
- Use subtle gradients through color variations in layered shapes

Always create comprehensive, detailed designs with 15-30+ elements per page section.
Make designs that look production-ready and could be implemented directly.
CRITICAL: Plan element creation order carefully - background elements first, content next, text last for proper visual layering.
Use overlapping and layering strategically to create modern, professional designs with depth and visual hierarchy.
Respond in the same language as the user's input.
`;

export const ADD_RECTANGLE_SHAPE_DESCRIPTION = `
Adds a rectangle shape to the canvas at the specified position.
Use this extensively to create detailed page layouts including: content areas, headers, footers, cards, buttons, navigation items, form fields, sidebars, hero sections, and background elements.
Create layered designs with multiple rectangles to achieve depth and modern visual appeal.
IMPORTANT: Consider stacking order - add background rectangles first, then overlay elements. Later additions appear on top.
Specify the top-left corner position (x, y) - the system will automatically calculate the center position.
Returns a JSON object containing the shape ID, type, and dimensions.
`;

export const ADD_CIRCLE_SHAPE_DESCRIPTION = `
Adds a circle shape to the canvas at the specified position.
Use circles for: user avatars, icons, decorative elements, buttons, badges, profile pictures, logo placeholders, and accent elements.
Combine with rectangles to create sophisticated layouts with visual interest.
IMPORTANT: Add circles after background rectangles but before text elements for proper layering.
Returns a JSON object containing the shape ID, type, and dimensions.
`;

export const ADD_TEXT_ELEMENT_DESCRIPTION = `
Adds a text element to the canvas at the specified position.
Use text elements extensively for: page titles, navigation labels, button text, section headings, content descriptions, form labels, and UI copy.
Create comprehensive text hierarchies with varying sizes and styles to represent complete page content.
IMPORTANT: Always add text elements LAST to ensure they appear on top of all other elements.
Specify the top-left corner position (x, y) - the system will automatically calculate the center position for text alignment.
Returns a JSON object containing the text element ID, content, and positioning.
`;

export const PAGE_DESIGN_TOOLS = [
	{
		type: "function",
		name: "add_rectangle_shape",
		description: ADD_RECTANGLE_SHAPE_DESCRIPTION,
		parameters: {
			type: "object",
			properties: {
				x: {
					type: "number",
					description: "The X coordinate of the top-left corner of the rectangle.",
				},
				y: {
					type: "number",
					description: "The Y coordinate of the top-left corner of the rectangle.",
				},
				width: {
					type: "number",
					description: "The width of the rectangle in pixels.",
				},
				height: {
					type: "number",
					description: "The height of the rectangle in pixels.",
				},
				fill: {
					type: "string",
					description: "The fill color of the rectangle (hex color code).",
				},
				stroke: {
					type: "string",
					description: "The stroke color of the rectangle (hex color code).",
				},
				strokeWidth: {
					type: "number",
					description: "The width of the stroke in pixels.",
				},
				rx: {
					type: "number",
					description: "The border radius for rounded corners.",
				},
			},
			additionalProperties: false,
			required: [
				"x",
				"y",
				"width",
				"height",
				"fill",
				"stroke",
				"strokeWidth",
				"rx",
			],
		},
		strict: true,
	},
	{
		type: "function",
		name: "add_circle_shape",
		description: ADD_CIRCLE_SHAPE_DESCRIPTION,
		parameters: {
			type: "object",
			properties: {
				cx: {
					type: "number",
					description: "The X coordinate of the top-left corner of the circle's bounding box.",
				},
				cy: {
					type: "number",
					description: "The Y coordinate of the top-left corner of the circle's bounding box.",
				},
				r: {
					type: "number",
					description: "The radius of the circle in pixels.",
				},
				fill: {
					type: "string",
					description: "The fill color of the circle (hex color code).",
				},
				stroke: {
					type: "string",
					description: "The stroke color of the circle (hex color code).",
				},
				strokeWidth: {
					type: "number",
					description: "The width of the stroke in pixels.",
				},
			},
			additionalProperties: false,
			required: ["cx", "cy", "r", "fill", "stroke", "strokeWidth"],
		},
		strict: true,
	},
	{
		type: "function",
		name: "add_text_element",
		description: ADD_TEXT_ELEMENT_DESCRIPTION,
		parameters: {
			type: "object",
			properties: {
				x: {
					type: "number",
					description: "The X coordinate of the top-left corner position for the text.",
				},
				y: {
					type: "number",
					description: "The Y coordinate of the top-left corner position for the text.",
				},
				width: {
					type: "number",
					description: "The width of the text box in pixels.",
				},
				height: {
					type: "number",
					description: "The height of the text box in pixels.",
				},
				text: {
					type: "string",
					description: "The text content to display.",
				},
				fontSize: {
					type: "number",
					description: "The font size in pixels.",
				},
				fill: {
					type: "string",
					description: "The text color (hex color code).",
				},
				fontFamily: {
					type: "string",
					description: "The font family for the text.",
				},
				textAlign: {
					type: "string",
					description: "Text horizontal alignment: 'left', 'center', or 'right'.",
					enum: ["left", "center", "right"],
				},
				verticalAlign: {
					type: "string",
					description: "Text vertical alignment: 'top', 'center', or 'bottom'.",
					enum: ["top", "center", "bottom"],
				},
			},
			additionalProperties: false,
			required: ["x", "y", "width", "height", "text", "fontSize", "fill", "fontFamily", "textAlign", "verticalAlign"],
		},
		strict: true,
	},
] as const satisfies OpenAI.Responses.Tool[];
