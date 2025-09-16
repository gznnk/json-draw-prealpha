export const ADD_TEXT_ELEMENT_DESCRIPTION = `
Adds a standalone text element to the canvas at the specified position.
USE ONLY FOR: standalone headings, paragraphs, descriptions, and text that appears WITHOUT a background shape.
DO NOT USE FOR: button text, navigation items, card titles, or any text that should have a background - use add_rectangle_shape with text parameters instead.

Appropriate use cases:
- Page headings and titles
- Standalone paragraphs and descriptions  
- Copyright notices and footnotes
- Standalone labels that don't need backgrounds

IMPORTANT: Always add text elements LAST to ensure they appear on top of all other elements.
Specify the top-left corner position (x, y) - the system will automatically calculate the center position for text alignment.
Returns a JSON object containing the text element ID, content, and positioning.
`;