import type React from "react";
import { memo, useRef, useEffect, useState, useCallback } from "react";

import { MAX_FONT_SIZE, MIN_FONT_SIZE } from "./DiagramMenuConstants";
import {
	DiagramMenuDiv,
	DiagramMenuDivider,
	DiagramMenuPositioner,
	DiagramMenuWrapper,
} from "./DiagramMenuStyled";
import type {
	DiagramMenuProps,
	DiagramMenuType,
	DiagramMenuStateMap,
} from "./DiagramMenuTypes";
import {
	findFirstFillableRecursive,
	findFirstPathableRecursive,
	findFirstStrokableRecursive,
	findFirstTextableRecursive,
	getCommonMenuConfig,
} from "./DiagramMenuUtils";
import { useDiagramMenuState } from "./hooks/useDiagramMenuState";
import { useDiagramUpdateRecursively } from "../../../../hooks/useDiagramUpdateRecursively";
import { DiagramRegistry } from "../../../../registry";
import type { PathType } from "../../../../types/core/PathType";
import type { FillableData } from "../../../../types/data/core/FillableData";
import type { StrokableData } from "../../../../types/data/core/StrokableData";
import type { TextableData } from "../../../../types/data/core/TextableData";
import type { Diagram } from "../../../../types/state/core/Diagram";
import { getSelectedDiagrams } from "../../../../utils/core/getSelectedDiagrams";
import { newEventId } from "../../../../utils/core/newEventId";
import { isItemableState } from "../../../../utils/validation/isItemableState";
import { FontColor } from "../../../icons/FontColor";
import { FontSize } from "../../../icons/FontSize";
import { AlignmentMenu } from "../AlignmentMenu";
import { ArrowHeadMenu } from "../ArrowHeadMenu";
import { BackgroundColorMenu } from "../BackgroundColorMenu";
import { BoldMenu } from "../BoldMenu";
import { BorderColorMenu } from "../BorderColorMenu";
import { BorderStyleMenu } from "../BorderStyleMenu";
import { ColorPicker } from "../ColorPicker";
import { DiagramMenuItem } from "../DiagramMenuItem";
import { GroupMenu } from "../GroupMenu";
import { KeepAspectRatioMenu } from "../KeepAspectRatioMenu";
import { LineColorMenu } from "../LineColorMenu";
import { LineStyleMenu } from "../LineStyleMenu";
import { NumberStepper } from "../NumberStepper";
import { StackOrderMenu } from "../StackOrderMenu";

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

	// Use diagram menu state hook to manage visibility, position, and selection state
	const { shouldRender, menuPosition, shouldDisplayMenu } = useDiagramMenuState(
		{
			canvasProps,
			containerWidth,
			containerHeight,
			menuRef,
			selectedItems,
			singleSelectedItem,
		},
	);

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

	// Use diagram update recursively hook for applying style changes
	const applyDiagramUpdate = useDiagramUpdateRecursively();

	// Utility functions for changing items
	const changeItems = useCallback(
		(
			items: Diagram[],
			data: Partial<Diagram>,
			recursively = true,
			eventId: string = newEventId(),
		) => {
			for (const item of items) {
				const newItem = { ...item };
				for (const key of Object.keys(data) as (keyof Diagram)[]) {
					if (key in newItem) {
						(newItem[key] as (typeof data)[keyof Diagram]) = data[key];
					}
				}
				canvasProps.onDiagramChange?.({
					eventId,
					eventPhase: "Ended",
					id: item.id,
					startDiagram: item,
					endDiagram: newItem,
				});

				if (recursively && isItemableState(newItem)) {
					changeItems(newItem.items, data, recursively, eventId);
				}
			}
		},
		[canvasProps],
	);

	const openControl = useCallback(
		(menuType: DiagramMenuType, currentMenuStateMap: DiagramMenuStateMap) => {
			const newControlsStateMap = {
				BgColor: false,
				BorderColor: false,
				LineStyle: false,
				FontSize: false,
				FontColor: false,
				Alignment: false,
			} as {
				[key in DiagramMenuType]: boolean;
			};

			// Check current state to determine if we should open the control
			const shouldOpen = currentMenuStateMap[menuType] === "Show";
			newControlsStateMap[menuType] = shouldOpen;

			setIsBgColorPickerOpen(newControlsStateMap.BgColor);
			setIsBorderColorPickerOpen(newControlsStateMap.BorderColor);
			setIsLineStyleMenuOpen(newControlsStateMap.LineStyle);
			setIsFontSizeSelectorOpen(newControlsStateMap.FontSize);
			setIsFontColorPickerOpen(newControlsStateMap.FontColor);
			setIsAlignmentMenuOpen(newControlsStateMap.Alignment);
		},
		[],
	);

	// Create a callback that uses the current menuStateMap
	const createMenuClickHandler =
		(currentMenuStateMap: DiagramMenuStateMap) => (menuType: string) => {
			switch (menuType) {
				case "BgColor":
					openControl("BgColor", currentMenuStateMap);
					break;
				case "BorderColor":
					openControl("BorderColor", currentMenuStateMap);
					break;
				case "LineStyle":
					openControl("LineStyle", currentMenuStateMap);
					break;
				case "FontSize":
					openControl("FontSize", currentMenuStateMap);
					break;
				case "FontColor":
					openControl("FontColor", currentMenuStateMap);
					break;
				case "Alignment":
					openControl("Alignment", currentMenuStateMap);
					break;
			}
		};

	const onFontSizeChange = useCallback(
		(fontSize: number) => {
			applyDiagramUpdate({ items: selectedItems, data: { fontSize } });
		},
		[selectedItems, applyDiagramUpdate],
	);

	const onFontColorChange = useCallback(
		(fontColor: string) => {
			applyDiagramUpdate({ items: selectedItems, data: { fontColor } });
		},
		[selectedItems, applyDiagramUpdate],
	);

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

	// Default menu state map.
	const menuStateMap = {
		FontSize: "Hidden",
		FontColor: "Hidden",
	} as DiagramMenuStateMap;

	// Find diagram items for styling
	const firstFillableItem = findFirstFillableRecursive(selectedItems) as
		| FillableData
		| undefined;
	const firstStrokableItem = findFirstStrokableRecursive(selectedItems) as
		| StrokableData
		| undefined;
	const firstTextableItem = findFirstTextableRecursive(selectedItems) as
		| TextableData
		| undefined;
	const firstPathableItem = findFirstPathableRecursive(selectedItems) as
		| { pathType: PathType }
		| undefined;

	// Set menu state based on selected items
	if (firstFillableItem) {
		menuStateMap.BgColor = isBgColorPickerOpen ? "Active" : "Show";
	}
	if (firstStrokableItem) {
		menuStateMap.BorderColor = isBorderColorPickerOpen ? "Active" : "Show";
	}
	if (firstPathableItem) {
		menuStateMap.LineStyle = isLineStyleMenuOpen ? "Active" : "Show";
	}
	if (firstTextableItem) {
		menuStateMap.FontSize = isFontSizeSelectorOpen ? "Active" : "Show";
		menuStateMap.FontColor = isFontColorPickerOpen ? "Active" : "Show";
		menuStateMap.Alignment = isAlignmentMenuOpen ? "Active" : "Show";
	}

	// Create the menu click handler with the current state
	const onMenuClick = createMenuClickHandler(menuStateMap);

	/**
	 * Check if the menu section should be shown based on the menu types provided.
	 *
	 * @param menuTypes - An array of menu types to check.
	 * @returns {boolean} - Returns true if any of the menu types are not "Hidden", otherwise false.
	 */
	const showSection = (...menuTypes: DiagramMenuType[]) => {
		return menuTypes.some((menuType) => menuStateMap[menuType] !== "Hidden");
	};

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
	const showTextAppearanceSection = showSection("FontSize", "FontColor");
	if (showTextAppearanceSection) {
		menuItemComponents.push(
			<DiagramMenuPositioner key="FontSize">
				<DiagramMenuItem
					menuType="FontSize"
					menuStateMap={menuStateMap}
					onMenuClick={onMenuClick}
				>
					<FontSize title="Font Size" />
				</DiagramMenuItem>
				{menuStateMap.FontSize === "Active" && (
					<NumberStepper
						value={firstTextableItem?.fontSize || 0}
						min={MIN_FONT_SIZE}
						max={MAX_FONT_SIZE}
						minusTooltip="Decrease font size"
						plusTooltip="Increase font size"
						onChange={onFontSizeChange}
					/>
				)}
			</DiagramMenuPositioner>,
		);
		menuItemComponents.push(
			<DiagramMenuPositioner key="FontColor">
				<DiagramMenuItem
					menuType="FontColor"
					menuStateMap={menuStateMap}
					onMenuClick={onMenuClick}
				>
					<FontColor title="Font Color" />
				</DiagramMenuItem>
				{menuStateMap.FontColor === "Active" && (
					<ColorPicker
						color={firstTextableItem?.fontColor || "transparent"}
						onColorChange={onFontColorChange}
					/>
				)}
			</DiagramMenuPositioner>,
		);
		menuItemComponents.push(
			<BoldMenu key="Bold" selectedDiagrams={selectedItems} />,
		);
		menuItemComponents.push(
			<DiagramMenuDivider key="TextAppearanceSectionDivider" />,
		);
	}

	// Create a section for alignment items.
	if (menuConfig.textAlignment) {
		menuItemComponents.push(
			<AlignmentMenu
				key="Alignment"
				isOpen={isAlignmentMenuOpen}
				onToggle={() => setIsAlignmentMenuOpen(!isAlignmentMenuOpen)}
				selectedDiagrams={selectedItems}
			/>,
		);
		menuItemComponents.push(
			<DiagramMenuDivider key="AlignmentSectionDivider" />,
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
