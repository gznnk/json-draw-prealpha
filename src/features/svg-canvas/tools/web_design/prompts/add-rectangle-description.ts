export const ADD_RECTANGLE_SHAPE_DESCRIPTION = `
Adds a rectangle shape to the canvas at the specified position with optional text content.
PREFERRED METHOD for creating buttons, cards, navigation items, form fields, badges, and any interactive element that combines a shape with text.
Use this extensively to create detailed page layouts including: content areas, headers, footers, cards, buttons, navigation items, form fields, sidebars, hero sections, and background elements.

TEXT INTEGRATION: Always use the text parameters (text, textAlign, verticalAlign, fontColor, fontSize, fontFamily, fontWeight) when creating:
- Buttons with labels
- Navigation menu items
- Card titles and content
- Form field labels
- Badges and tags
- Interactive elements

Create layered designs with multiple rectangles to achieve depth and modern visual appeal.
IMPORTANT: Consider stacking order - add background rectangles first, then interactive elements with text.
Specify the top-left corner position (x, y) - the system will automatically calculate the center position.
Returns a JSON object containing the shape ID, type, and dimensions.
`;