import type React from "react";
import { memo, useCallback, useMemo, useRef, useState } from "react";

// ライブラリのインポート
import styled from "@emotion/styled";

export type ContextMenuType = "Group" | "Ungroup" | "Copy" | "Paste" | "Delete";

/**
 * svg要素のコンテナのスタイル定義
 */
const ContainerDiv = styled.div`
	position: fixed;
    top: 0;
    left: 0;
	right: 0;
	bottom: 0;
	overflow: none;
    pointer-events: none;
`;

type ContextMenuDivProps = {
	x: number;
	y: number;
};

const ContextMenuDiv = styled.div<ContextMenuDivProps>`
    position: absolute;
    top: ${(props) => props.y}px;
    left: ${(props) => props.x}px;
    background-color: #ddd;
    border: 1px solid #000;
    border-radius: 5px;
    pointer-events: auto;
    user-select: none;
`;

type ContextMenuProps = {
	x: number;
	y: number;
	isVisible: boolean;
	onMenuClick: (menuType: ContextMenuType) => void;
};

const ContextMenu: React.FC<ContextMenuProps> = ({
	x,
	y,
	isVisible,
	onMenuClick,
}) => {
	if (!isVisible) return null;

	return (
		<ContainerDiv>
			<ContextMenuDiv x={x} y={y}>
				<ContextMenuItem menuType="Group" onMenuClick={onMenuClick}>
					グループ化
				</ContextMenuItem>
				<ContextMenuItem menuType="Ungroup" onMenuClick={onMenuClick}>
					グループ解除
				</ContextMenuItem>
			</ContextMenuDiv>
		</ContainerDiv>
	);
};

export default memo(ContextMenu);

const ContextMenuItemDiv = styled.div`
    padding: 5px;
    cursor: pointer;
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
