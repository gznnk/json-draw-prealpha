import type React from "react";

// Imports related to this component.
import { CanvasMenuItemDiv } from "./CanvasMenuItemStyled";

type CanvasMenuItemProps = {
	onClick?: () => void;
	children: React.ReactNode;
};

export const CanvasMenuItem: React.FC<CanvasMenuItemProps> = ({
	onClick,
	children,
}) => {
	return <CanvasMenuItemDiv onClick={onClick}>{children}</CanvasMenuItemDiv>;
};
