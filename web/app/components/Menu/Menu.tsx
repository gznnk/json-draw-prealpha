import type React from "react";
import { memo, useState, useRef } from "react";
import { createPortal } from "react-dom";

import {
	MenuContainer,
	MenuItem,
	MenuDropdown,
	MenuDropdownItem,
} from "./MenuStyled";
import { useMenuPlugin } from "../../hooks/useMenuPlugin";

/**
 * Props for the MenuComponent.
 */
type MenuProps = {
	/**
	 * Callback invoked when new file is selected
	 */
	onNew?: () => void;
	/**
	 * Callback invoked when open file is selected
	 */
	onOpen?: () => void;
	/**
	 * Callback invoked when save file is selected
	 */
	onSave?: () => void;
	/**
	 * Callback invoked when help is selected
	 */
	onHelp?: () => void;
};

/**
 * Menu component that provides application menu functionality similar to draw.io.
 * Includes File menu (New, Open, Save) and Help menu.
 *
 * @param props - Component props
 * @returns ReactElement representing the menu
 */
const MenuComponent: React.FC<MenuProps> = ({
	onNew: legacyOnNew,
	onOpen: legacyOnOpen,
	onSave: legacyOnSave,
	onHelp: legacyOnHelp,
}) => {
	// Use the plugin system for menu actions
	const { onNew, onOpen, onSave, onHelp } = useMenuPlugin();
	const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
	const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
	const menuItemRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

	const handleMenuClick = (menuName: string) => {
		console.log("Menu clicked:", menuName, "Current active:", activeDropdown);

		const menuElement = menuItemRefs.current[menuName];
		if (menuElement) {
			const rect = menuElement.getBoundingClientRect();
			setDropdownPosition({
				top: rect.bottom - 1, // 1px重複させて隙間をなくす
				left: rect.left,
			});
		}

		setActiveDropdown(menuName);
	};

	const handleItemClick = async (
		pluginAction: (() => Promise<void>) | (() => void),
		legacyAction?: () => void
	) => {
		setActiveDropdown(null);
		
		try {
			// Use plugin action first, fall back to legacy if provided
			await pluginAction();
			
			// Also call legacy callback if provided (for backward compatibility)
			legacyAction?.();
		} catch (error) {
			console.error("Menu action failed:", error);
		}
	};

	const handleMouseLeave = () => {
		// ドロップダウン外に出た時のみ閉じる
		setActiveDropdown(null);
	};

	return (
		<MenuContainer onMouseLeave={handleMouseLeave}>
			<MenuItem
				ref={(el) => {
					menuItemRefs.current["file"] = el;
				}}
				isActive={activeDropdown === "file"}
				onClick={() => handleMenuClick("file")}
			>
				ファイル
			</MenuItem>
			<MenuItem
				ref={(el) => {
					menuItemRefs.current["help"] = el;
				}}
				isActive={activeDropdown === "help"}
				onClick={() => handleMenuClick("help")}
			>
				ヘルプ
			</MenuItem>
			{activeDropdown &&
				createPortal(
					<MenuDropdown
						style={{
							position: "fixed",
							top: dropdownPosition.top,
							left: dropdownPosition.left,
						}}
					>
						{activeDropdown === "file" && (
							<>
								<MenuDropdownItem onClick={() => handleItemClick(onNew, legacyOnNew)}>
									新規作成
								</MenuDropdownItem>
								<MenuDropdownItem onClick={() => handleItemClick(onOpen, legacyOnOpen)}>
									開く
								</MenuDropdownItem>
								<MenuDropdownItem onClick={() => handleItemClick(onSave, legacyOnSave)}>
									保存
								</MenuDropdownItem>
							</>
						)}
						{activeDropdown === "help" && (
							<MenuDropdownItem onClick={() => handleItemClick(onHelp, legacyOnHelp)}>
								ヘルプ
							</MenuDropdownItem>
						)}
					</MenuDropdown>,
					document.body,
				)}
		</MenuContainer>
	);
};

export const Menu = memo(MenuComponent);
