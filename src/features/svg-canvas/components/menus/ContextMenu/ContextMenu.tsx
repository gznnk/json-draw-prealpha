// Import React.
import type React from "react";
import { memo, useCallback } from "react";

// Import other libraries.
import styled from "@emotion/styled";

// Imports related to this component.
import { ContextMenuDiv, ContextMenuDivider } from "./ContextMenuStyled";
import type { ContextMenuStateMap, ContextMenuType } from "./ContextMenuTypes";

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
