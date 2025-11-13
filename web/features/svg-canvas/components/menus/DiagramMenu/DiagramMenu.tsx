import type React from "react";
import { memo, useRef, useEffect, useState } from "react";

import { AlignmentMenu } from "./components/items/AlignmentMenu";
import { ArrowHeadMenu } from "./components/items/ArrowHeadMenu";
import { BackgroundColorMenu } from "./components/items/BackgroundColorMenu";
import { BoldMenu } from "./components/items/BoldMenu";
import { BorderColorMenu } from "./components/items/BorderColorMenu";
import { BorderStyleMenu } from "./components/items/BorderStyleMenu";
import { FontColorMenu } from "./components/items/FontColorMenu";
import { FontSizeMenu } from "./components/items/FontSizeMenu";
import { GroupMenu } from "./components/items/GroupMenu";
import { KeepAspectRatioMenu } from "./components/items/KeepAspectRatioMenu";
import { LineColorMenu } from "./components/items/LineColorMenu";
import { LineStyleMenu } from "./components/items/LineStyleMenu";
import { StackOrderMenu } from "./components/items/StackOrderMenu";
import {
	DiagramMenuDiv,
	DiagramMenuDivider,
	DiagramMenuWrapper,
} from "./DiagramMenuStyled";
import type { DiagramMenuProps } from "./DiagramMenuTypes";
import { getCommonMenuConfig } from "./DiagramMenuUtils";
import { useDiagramMenuDisplay } from "./hooks/useDiagramMenuDisplay";
import { DiagramRegistry } from "../../../registry";
import { getSelectedDiagrams } from "../../../utils/core/getSelectedDiagrams";

const DiagramMenuComponent: React.FC<DiagramMenuProps> = ({
	canvasProps,
	containerWidth,
	containerHeight,
}) => {
	const menuRef = useRef<HTMLDivElement>(null);

	// Get selected items from canvas
	const selectedItems = getSelectedDiagrams(canvasProps.items);
	const singleSelectedItem =
		selectedItems.length === 1 ? selectedItems[0] : undefined;

	// Use diagram menu display hook to manage visibility, position, and selection state
	const { shouldRender, menuPosition, shouldDisplayMenu } =
		useDiagramMenuDisplay({
			canvasProps,
			containerWidth,
			containerHeight,
			menuRef,
			selectedItems,
			singleSelectedItem,
		});

	// Diagram menu controls open/close state.
	const [isBgColorPickerOpen, setIsBgColorPickerOpen] = useState(false);
	const [isBorderColorPickerOpen, setIsBorderColorPickerOpen] = useState(false);
	const [isLineColorPickerOpen, setIsLineColorPickerOpen] = useState(false);
	const [isBorderStyleMenuOpen, setIsBorderStyleMenuOpen] = useState(false);
	const [isLineStyleMenuOpen, setIsLineStyleMenuOpen] = useState(false);
	const [isFontSizeSelectorOpen, setIsFontSizeSelectorOpen] = useState(false);
	const [isFontColorPickerOpen, setIsFontColorPickerOpen] = useState(false);
	const [isAlignmentMenuOpen, setIsAlignmentMenuOpen] = useState(false);
	const [isStackOrderMenuOpen, setIsStackOrderMenuOpen] = useState(false);

	// If the diagram menu is not shown, close controls.
	useEffect(() => {
		if (!shouldRender) {
			setIsBgColorPickerOpen(false);
			setIsBorderColorPickerOpen(false);
			setIsLineColorPickerOpen(false);
			setIsBorderStyleMenuOpen(false);
			setIsLineStyleMenuOpen(false);
			setIsFontSizeSelectorOpen(false);
			setIsFontColorPickerOpen(false);
			setIsAlignmentMenuOpen(false);
			setIsStackOrderMenuOpen(false);
		}
	}, [shouldRender]);

	if (!shouldRender) return null;

	// Get common menu configuration for selected diagrams
	const menuConfig = getCommonMenuConfig(selectedItems);

	// Array to hold the menu item components.
	// This will be used to render the menu items conditionally based on the state map.
	const menuItemComponents = [];

	// Create a section for arrow head.
	if (menuConfig.arrowHead) {
		menuItemComponents.push(
			<ArrowHeadMenu key="Arrow" selectedDiagrams={selectedItems} />,
		);
		menuItemComponents.push(<DiagramMenuDivider key="ArrowDivider" />);
	}

	// Create a section for line appearance items.
	if (menuConfig.lineColor) {
		menuItemComponents.push(
			<LineColorMenu
				key="LineColor"
				isOpen={isLineColorPickerOpen}
				onToggle={() => setIsLineColorPickerOpen(!isLineColorPickerOpen)}
				selectedDiagrams={selectedItems}
			/>,
		);
	}

	if (menuConfig.lineStyle) {
		menuItemComponents.push(
			<LineStyleMenu
				key="LineStyle"
				isOpen={isLineStyleMenuOpen}
				onToggle={() => setIsLineStyleMenuOpen(!isLineStyleMenuOpen)}
				selectedDiagrams={selectedItems}
			/>,
		);
	}

	if (menuConfig.lineColor || menuConfig.lineStyle) {
		menuItemComponents.push(<DiagramMenuDivider key="LineSectionDivider" />);
	}

	// Create a section for shape style items.
	if (menuConfig.backgroundColor) {
		menuItemComponents.push(
			<BackgroundColorMenu
				key="BgColor"
				isOpen={isBgColorPickerOpen}
				onToggle={() => setIsBgColorPickerOpen(!isBgColorPickerOpen)}
				selectedDiagrams={selectedItems}
			/>,
		);
	}

	if (menuConfig.borderColor) {
		menuItemComponents.push(
			<BorderColorMenu
				key="BorderColor"
				isOpen={isBorderColorPickerOpen}
				onToggle={() => setIsBorderColorPickerOpen(!isBorderColorPickerOpen)}
				selectedDiagrams={selectedItems}
			/>,
		);
	}

	if (menuConfig.borderStyle) {
		menuItemComponents.push(
			<BorderStyleMenu
				key="BorderStyle"
				isOpen={isBorderStyleMenuOpen}
				onToggle={() => setIsBorderStyleMenuOpen(!isBorderStyleMenuOpen)}
				selectedDiagrams={selectedItems}
				showRadius={menuConfig.borderStyle.radius}
			/>,
		);
	}

	if (
		menuConfig.backgroundColor ||
		menuConfig.borderColor ||
		menuConfig.borderStyle
	) {
		menuItemComponents.push(
			<DiagramMenuDivider key="ShapeStyleSectionDivider" />,
		);
	}

	// Create a section for text appearance items.
	if (menuConfig.fontStyle) {
		menuItemComponents.push(
			<FontSizeMenu
				key="FontSize"
				isOpen={isFontSizeSelectorOpen}
				onToggle={() => setIsFontSizeSelectorOpen(!isFontSizeSelectorOpen)}
				selectedDiagrams={selectedItems}
			/>,
		);
		menuItemComponents.push(
			<FontColorMenu
				key="FontColor"
				isOpen={isFontColorPickerOpen}
				onToggle={() => setIsFontColorPickerOpen(!isFontColorPickerOpen)}
				selectedDiagrams={selectedItems}
			/>,
		);
		menuItemComponents.push(
			<BoldMenu key="Bold" selectedDiagrams={selectedItems} />,
		);
	}

	if (menuConfig.textAlignment) {
		menuItemComponents.push(
			<AlignmentMenu
				key="Alignment"
				isOpen={isAlignmentMenuOpen}
				onToggle={() => setIsAlignmentMenuOpen(!isAlignmentMenuOpen)}
				selectedDiagrams={selectedItems}
			/>,
		);
	}

	if (menuConfig.fontStyle || menuConfig.textAlignment) {
		menuItemComponents.push(
			<DiagramMenuDivider key="TextAppearanceSectionDivider" />,
		);
	}

	// Create a section for stack order items.
	const slouldDisplayStackOrderMenu = selectedItems.length > 0;
	if (slouldDisplayStackOrderMenu) {
		menuItemComponents.push(
			<StackOrderMenu
				key="StackOrder"
				isOpen={isStackOrderMenuOpen}
				onToggle={() => setIsStackOrderMenuOpen(!isStackOrderMenuOpen)}
				selectedDiagrams={selectedItems}
			/>,
		);
		menuItemComponents.push(
			<DiagramMenuDivider key="StackOrderSectionDivider" />,
		);
	}

	// Create a section for keep aspect ratio items if applicable.
	const shouldDisplayKeepAspectRatioMenu = Boolean(
		(singleSelectedItem &&
			DiagramRegistry.getMenuConfig(singleSelectedItem.type)?.aspectRatio) ||
			canvasProps.multiSelectGroup,
	);
	if (shouldDisplayKeepAspectRatioMenu) {
		// Create a section for keep aspect ratio items.
		menuItemComponents.push(
			<KeepAspectRatioMenu
				key="KeepAspectRatio"
				multiSelectGroup={canvasProps.multiSelectGroup}
				selectedDiagrams={selectedItems}
			/>,
		);
		menuItemComponents.push(
			<DiagramMenuDivider key="KeepAspectRatioSectionDivider" />,
		);
	}

	// Create a section for group and ungroup items.
	const shouldShowGroupMenu = Boolean(
		canvasProps.multiSelectGroup ||
			(singleSelectedItem && singleSelectedItem.type === "Group"),
	);
	if (shouldShowGroupMenu) {
		// Create a section for group and ungroup items.
		menuItemComponents.push(
			<GroupMenu key="Group" selectedDiagrams={selectedItems} />,
		);
		menuItemComponents.push(<DiagramMenuDivider key="GroupSectionDivider" />);
	}

	// Remove the last divider.
	menuItemComponents.pop();

	return (
		<DiagramMenuWrapper
			x={menuPosition.x}
			y={menuPosition.y}
			zIndex={shouldDisplayMenu ? 1060 : -1}
		>
			<DiagramMenuDiv ref={menuRef}>
				{menuItemComponents.map((component) => component)}
			</DiagramMenuDiv>
		</DiagramMenuWrapper>
	);
};

export const DiagramMenu = memo(DiagramMenuComponent);
