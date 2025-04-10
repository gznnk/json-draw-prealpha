// Import React.
import type React from "react";
import { memo, useCallback } from "react";

// Import other libraries.
import styled from "@emotion/styled";

// Imports related to this component.
import type { ContextMenuStateMap, ContextMenuType } from "./types";

/**
 * Properties for the ContextMenuDiv.
 */
type ContextMenuDivProps = {
	x: number;
	y: number;
};

/**
 * Style for the context menu.
 */
const ContextMenuDiv = styled.div<ContextMenuDivProps>`
    position: absolute;
    top: ${(props) => props.y}px;
    left: ${(props) => props.x}px;
	min-width: 200px;
	padding: 3px 4px;
    background-color: #F9F9F9;
	border: 1px solid #E0E0E0;
    border-radius: 4px;
	box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    pointer-events: auto;
    user-select: none;
`;

/**
 * Properties for the ContextMenu component.
 */
type ContextMenuProps = {
	x: number;
	y: number;
	menuStateMap: ContextMenuStateMap;
	isVisible: boolean;
	onMenuClick: (menuType: ContextMenuType) => void;
};

/**
 * ContextMenu component.
 */
const ContextMenuComponent: React.FC<ContextMenuProps> = ({
	x,
	y,
	menuStateMap,
	isVisible,
	onMenuClick,
}) => {
	if (!isVisible) return null;

	const menuItemProps = {
		menuStateMap,
		onMenuClick,
	};

	return (
		<ContextMenuDiv x={x} y={y}>
			<ContextMenuItem menuType="Undo" {...menuItemProps}>
				元に戻す
			</ContextMenuItem>
			<ContextMenuItem menuType="Redo" {...menuItemProps}>
				やり直し
			</ContextMenuItem>
			<ContextMenuDivider />
			<ContextMenuItem menuType="SelectAll" {...menuItemProps}>
				すべて選択
			</ContextMenuItem>
			<ContextMenuDivider />
			<ContextMenuItem menuType="Group" {...menuItemProps}>
				グループ化
			</ContextMenuItem>
			<ContextMenuItem menuType="Ungroup" {...menuItemProps}>
				グループ解除
			</ContextMenuItem>
			<ContextMenuDivider />
			<ContextMenuItem menuType="Delete" {...menuItemProps}>
				削除
			</ContextMenuItem>
		</ContextMenuDiv>
	);
};

export const ContextMenu = memo(ContextMenuComponent);

const ContextMenuItemDiv = styled.div`
	font-size: 14px;
	color: #333333;
    padding: 3px 5px;
    cursor: pointer;
	&:hover {
		background-color: #EEEEEE;
	}
	&.disabled {
		color: #BDBDBD;
		pointer-events: none;
	}
`;

type ContextMenuItemProps = {
	menuType: ContextMenuType;
	menuStateMap: ContextMenuStateMap;
	children: React.ReactNode;
	onMenuClick: (menuType: ContextMenuType) => void;
};

const ContextMenuItem: React.FC<ContextMenuItemProps> = ({
	menuType,
	menuStateMap,
	onMenuClick,
	children,
}) => {
	const handleMenuClick = useCallback(() => {
		onMenuClick(menuType);
	}, [menuType, onMenuClick]);

	const menuState = menuStateMap[menuType];
	if (menuState === "Hidden") return null;

	return (
		<ContextMenuItemDiv
			className={menuState === "Disable" ? "disabled" : ""}
			onClick={handleMenuClick}
		>
			{children}
		</ContextMenuItemDiv>
	);
};

const ContextMenuDivider = styled.div`
	height: 1px;
	margin-top: 3px;
	margin-bottom: 3px;
	background-color: #E0E0E0;
`;
