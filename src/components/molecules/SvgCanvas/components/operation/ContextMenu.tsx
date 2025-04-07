// Import React library.
import type React from "react";
import { memo, useCallback } from "react";

// Import other libraries.
import styled from "@emotion/styled";

/**
 * Context menu types.
 */
export type ContextMenuType =
	| "Undo"
	| "Redo"
	| "Copy"
	| "Paste"
	| "Group"
	| "Ungroup"
	| "Delete";

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
	isVisible: boolean;
	onMenuClick: (menuType: ContextMenuType) => void;
};

/**
 * ContextMenu component.
 */
const ContextMenu: React.FC<ContextMenuProps> = ({
	x,
	y,
	isVisible,
	onMenuClick,
}) => {
	if (!isVisible) return null;

	return (
		<ContextMenuDiv x={x} y={y}>
			<ContextMenuItem menuType="Undo" onMenuClick={onMenuClick}>
				元に戻す
			</ContextMenuItem>
			<ContextMenuItem menuType="Redo" onMenuClick={onMenuClick}>
				やり直し
			</ContextMenuItem>
			<ContextMenuDivider />
			<ContextMenuItem menuType="Group" onMenuClick={onMenuClick}>
				グループ化
			</ContextMenuItem>
			<ContextMenuItem menuType="Ungroup" onMenuClick={onMenuClick}>
				グループ解除
			</ContextMenuItem>
			<ContextMenuDivider />
			<ContextMenuItem menuType="Delete" onMenuClick={onMenuClick}>
				削除
			</ContextMenuItem>
		</ContextMenuDiv>
	);
};

export default memo(ContextMenu);

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
	children: React.ReactNode;
	onMenuClick: (menuType: ContextMenuType) => void;
};

const ContextMenuItem: React.FC<ContextMenuItemProps> = ({
	menuType,
	onMenuClick,
	children,
}) => {
	const handleMenuClick = useCallback(() => {
		onMenuClick(menuType);
	}, [menuType, onMenuClick]);

	return (
		<ContextMenuItemDiv onClick={handleMenuClick}>
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
