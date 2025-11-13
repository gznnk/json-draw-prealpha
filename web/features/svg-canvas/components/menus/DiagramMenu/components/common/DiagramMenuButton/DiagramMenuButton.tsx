import type React from "react";
import { memo } from "react";

import { DiagramMenuButtonDiv } from "./DiagramMenuButtonStyled";

/**
 * Props for the DiagramMenuButton component.
 * This is a button component for diagram menu items.
 */
type DiagramMenuButtonProps = {
	/** Whether the menu button is in active state */
	isActive?: boolean;

	/** Click handler for the menu button */
	onClick: () => void;

	/** Content to render inside the menu button (typically an icon) */
	children: React.ReactNode;

	/** Whether the menu button should be hidden */
	isHidden?: boolean;
};

/**
 * Diagram menu button component.
 * This button is used for menu items in the diagram menu.
 */
const DiagramMenuButtonComponent: React.FC<DiagramMenuButtonProps> = ({
	isActive = false,
	onClick,
	children,
	isHidden = false,
}) => {
	if (isHidden) return null;

	return (
		<DiagramMenuButtonDiv
			className={isActive ? "active" : ""}
			onClick={onClick}
		>
			{children}
		</DiagramMenuButtonDiv>
	);
};

export const DiagramMenuButton = memo(DiagramMenuButtonComponent);
