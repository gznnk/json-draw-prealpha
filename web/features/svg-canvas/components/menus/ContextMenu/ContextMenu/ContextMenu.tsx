import type React from "react";
import { memo } from "react";

// Imports related to this component.
import { ContextMenuItem } from "../ContextMenuItem";
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
				Undo
			</ContextMenuItem>
			<ContextMenuItem menuType="Redo" {...menuItemProps}>
				Redo
			</ContextMenuItem>
			<ContextMenuDivider />
			<ContextMenuItem menuType="Copy" {...menuItemProps}>
				Copy
			</ContextMenuItem>
			<ContextMenuItem menuType="Paste" {...menuItemProps}>
				Paste
			</ContextMenuItem>
			<ContextMenuDivider />
			<ContextMenuItem menuType="SelectAll" {...menuItemProps}>
				Select All
			</ContextMenuItem>
			<ContextMenuDivider />
			<ContextMenuItem menuType="Group" {...menuItemProps}>
				Group
			</ContextMenuItem>
			<ContextMenuItem menuType="Ungroup" {...menuItemProps}>
				Ungroup
			</ContextMenuItem>
			<ContextMenuDivider />
			<ContextMenuItem menuType="Export" {...menuItemProps}>
				Export
			</ContextMenuItem>
			<ContextMenuDivider />
			<ContextMenuItem menuType="Delete" {...menuItemProps}>
				Delete
			</ContextMenuItem>
		</ContextMenuDiv>
	);
};

export const ContextMenu = memo(ContextMenuComponent);
