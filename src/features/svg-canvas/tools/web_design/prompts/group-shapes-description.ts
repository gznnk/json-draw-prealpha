export const GROUP_SHAPES_DESCRIPTION = `
Groups multiple shapes together by their IDs to create logical UI components.
Use this tool to organize related elements into cohesive units for better design structure and management.

STRATEGIC GROUPING - Group elements that form logical UI components:
- **Navigation sections**: Group navigation background, menu items, and navigation text together
- **Card components**: Group card background, content areas, and card text elements
- **Button sets**: Group multiple related buttons (like CTA button groups, form buttons)
- **Header/Footer sections**: Group background areas with their content elements
- **Form sections**: Group form background, input fields, labels, and submit buttons
- **Hero sections**: Group hero background, headline text, and CTA elements
- **Content blocks**: Group content background with related text and interactive elements

TIMING: Use group_shapes AFTER creating all related elements for a component section.
This ensures proper organization and makes the design more maintainable.

BENEFITS:
- Creates logical design structure
- Enables easier manipulation of component sections
- Improves design organization and maintainability
- Allows users to move entire UI sections as units

Use this tool strategically to create well-organized, professional layouts with clear component boundaries.
Returns a JSON object confirming the grouping operation with the affected shape IDs.
`;