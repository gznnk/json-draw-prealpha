// Import React.
import type React from "react";
import { memo } from "react";

// Imports related to this component.
import { DiagramMenuItemDiv } from "./DiagramMenuItemStyled";

/**
 * Props for the DiagramMenuItem component.
 */
type DiagramMenuItemProps = {
	children: React.ReactNode;
};

/**
 * Diagram menu item component.
 */
const DiagramMenuItemComponent: React.FC<DiagramMenuItemProps> = ({
	children,
}) => {
	return <DiagramMenuItemDiv>{children}</DiagramMenuItemDiv>;
};

export const DiagramMenuItem = memo(DiagramMenuItemComponent);
