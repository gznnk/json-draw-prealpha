// Import React.
import type React from "react";
import { memo, useCallback } from "react";

// Imports related to this component.
import type {
	DiagramMenuStateMap,
	DiagramMenuType,
} from "../DiagramMenu/DiagramMenuTypes";
import { DiagramMenuItemDiv } from "./DiagramMenuItemStyled";

/**
 * Props for the DiagramMenuItem component.
 */
type DiagramMenuItemProps = {
	menuType: DiagramMenuType;
	menuStateMap: DiagramMenuStateMap;
	children: React.ReactNode;
	onMenuClick: (menuType: DiagramMenuType) => void;
};

/**
 * Diagram menu item component.
 */
const DiagramMenuItemComponent: React.FC<DiagramMenuItemProps> = ({
	menuType,
	menuStateMap,
	children,
	onMenuClick,
}) => {
	const handleMenuClick = useCallback(() => {
		onMenuClick(menuType);
	}, [menuType, onMenuClick]);

	const menuState = menuStateMap[menuType];
	if (menuState === "Hidden") return null;

	return (
		<DiagramMenuItemDiv
			className={menuState === "Active" ? "active" : ""}
			onClick={handleMenuClick}
		>
			{children}
		</DiagramMenuItemDiv>
	);
};

export const DiagramMenuItem = memo(DiagramMenuItemComponent);
