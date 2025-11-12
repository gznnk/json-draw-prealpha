import type React from "react";
import { memo } from "react";

import { DiagramMenuItemDiv } from "./DiagramMenuItemStyled";

/**
 * Props for the DiagramMenuItemNew component.
 * This is a simplified version designed for self-contained menu items.
 */
type DiagramMenuItemNewProps = {
	/** Whether the menu item is in active state */
	isActive?: boolean;

	/** Click handler for the menu item */
	onClick: () => void;

	/** Content to render inside the menu item (typically an icon) */
	children: React.ReactNode;

	/** Whether the menu item should be hidden */
	isHidden?: boolean;
};

/**
 * Diagram menu item component with simplified props.
 * This version is designed for menu items that manage their own state internally.
 */
const DiagramMenuItemNewComponent: React.FC<DiagramMenuItemNewProps> = ({
	isActive = false,
	onClick,
	children,
	isHidden = false,
}) => {
	if (isHidden) return null;

	return (
		<DiagramMenuItemDiv className={isActive ? "active" : ""} onClick={onClick}>
			{children}
		</DiagramMenuItemDiv>
	);
};

export const DiagramMenuItemNew = memo(DiagramMenuItemNewComponent);
