// Import React.
import type React from "react";
import { memo } from "react";

// Imports related to this component.
import { ContextMenuItem } from "../ContextMenuItem/ContextMenuItem";
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
