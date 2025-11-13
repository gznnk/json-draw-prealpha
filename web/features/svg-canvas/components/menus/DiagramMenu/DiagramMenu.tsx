import type React from "react";
import { memo, useRef } from "react";

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
import { useDiagramMenuDisplay } from "./hooks/useDiagramMenuDisplay";
import { useDiagramMenuItemsState } from "./hooks/useDiagramMenuItemsState";
import { getCommonMenuConfig } from "./utils/getCommonMenuConfig";
import type { SvgCanvasProps } from "../../../canvas/types/SvgCanvasProps";
import { DiagramRegistry } from "../../../registry";
import { getSelectedDiagrams } from "../../../utils/core/getSelectedDiagrams";

type DiagramMenuProps = {
	canvasProps: SvgCanvasProps;
	containerWidth: number;
	containerHeight: number;
};

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

	// Use menu items state to handle open/close state for all sub-menus
	// Only one menu can be open at a time (exclusive behavior)
	const menuState = useDiagramMenuItemsState({ shouldCloseAll: !shouldRender });

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
				isOpen={menuState.isOpen("lineColor")}
				onToggle={() => menuState.toggle("lineColor")}
				selectedDiagrams={selectedItems}
			/>,
		);
	}

	if (menuConfig.lineStyle) {
		menuItemComponents.push(
			<LineStyleMenu
				key="LineStyle"
				isOpen={menuState.isOpen("lineStyle")}
				onToggle={() => menuState.toggle("lineStyle")}
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
				isOpen={menuState.isOpen("bgColor")}
				onToggle={() => menuState.toggle("bgColor")}
				selectedDiagrams={selectedItems}
			/>,
		);
	}

	if (menuConfig.borderColor) {
		menuItemComponents.push(
			<BorderColorMenu
				key="BorderColor"
				isOpen={menuState.isOpen("borderColor")}
				onToggle={() => menuState.toggle("borderColor")}
				selectedDiagrams={selectedItems}
			/>,
		);
	}

	if (menuConfig.borderStyle) {
		menuItemComponents.push(
			<BorderStyleMenu
				key="BorderStyle"
				isOpen={menuState.isOpen("borderStyle")}
				onToggle={() => menuState.toggle("borderStyle")}
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
				isOpen={menuState.isOpen("fontSize")}
				onToggle={() => menuState.toggle("fontSize")}
				selectedDiagrams={selectedItems}
			/>,
		);
		menuItemComponents.push(
			<FontColorMenu
				key="FontColor"
				isOpen={menuState.isOpen("fontColor")}
				onToggle={() => menuState.toggle("fontColor")}
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
				isOpen={menuState.isOpen("alignment")}
				onToggle={() => menuState.toggle("alignment")}
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
				isOpen={menuState.isOpen("stackOrder")}
				onToggle={() => menuState.toggle("stackOrder")}
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
