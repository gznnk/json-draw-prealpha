import type React from "react";
import { memo, useRef, useEffect, useState, useCallback } from "react";

import {
	MAX_BORDER_RADIUS,
	MAX_FONT_SIZE,
	MIN_BORDER_RADIUS,
	MIN_FONT_SIZE,
} from "./DiagramMenuConstants";
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
	findFirstCornerRoundableRecursive,
	findFirstFillableRecursive,
	findFirstPathableRecursive,
	findFirstStrokableRecursive,
	findFirstTextableRecursive,
	getCommonMenuConfig,
} from "./DiagramMenuUtils";
import { useDiagramMenuState } from "./hooks/useDiagramMenuState";
import { useStyleChange } from "../../../../hooks/useStyleChange";
import type { PathType } from "../../../../types/core/PathType";
import type { CornerRoundableData } from "../../../../types/data/core/CornerRoundableData";
import type { FillableData } from "../../../../types/data/core/FillableData";
import type { StrokableData } from "../../../../types/data/core/StrokableData";
import type { TextableData } from "../../../../types/data/core/TextableData";
import type { Diagram } from "../../../../types/state/core/Diagram";
import { getSelectedDiagrams } from "../../../../utils/core/getSelectedDiagrams";
import { newEventId } from "../../../../utils/core/newEventId";
import { isItemableState } from "../../../../utils/validation/isItemableState";
import { isTextableState } from "../../../../utils/validation/isTextableState";
import { BgColor } from "../../../icons/BgColor";
import { Bold } from "../../../icons/Bold";
import { BorderRadius } from "../../../icons/BorderRadius";
import { Edit } from "../../../icons/Edit";
import { FontColor } from "../../../icons/FontColor";
import { FontSize } from "../../../icons/FontSize";
import { AlignmentMenu } from "../AlignmentMenu/AlignmentMenu";
import { ColorPicker } from "../ColorPicker";
import { DiagramMenuItem } from "../DiagramMenuItem";
import { GroupMenu } from "../GroupMenu/GroupMenu";
import { KeepAspectRatioMenu } from "../KeepAspectRatioMenu";
import { LineStyleMenu } from "../LineStyleMenu";
import { NumberStepper } from "../NumberStepper";
import { StackOrderMenu } from "../StackOrderMenu/StackOrderMenu";

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
	const [isBorderRadiusSelectorOpen, setIsBorderRadiusSelectorOpen] =
		useState(false);
	const [isLineStyleMenuOpen, setIsLineStyleMenuOpen] = useState(false);
	const [isFontSizeSelectorOpen, setIsFontSizeSelectorOpen] = useState(false);
	const [isFontColorPickerOpen, setIsFontColorPickerOpen] = useState(false);
	const [isAlignmentMenuOpen, setIsAlignmentMenuOpen] = useState(false);
	const [isStackOrderMenuOpen, setIsStackOrderMenuOpen] = useState(false);

	// Use style change hook for applying style changes
	const applyStyleChange = useStyleChange();

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
				BorderRadius: false,
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
			setIsBorderRadiusSelectorOpen(newControlsStateMap.BorderRadius);
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
				case "BorderRadius":
					openControl("BorderRadius", currentMenuStateMap);
					break;
				case "LineStyle":
					openControl("LineStyle", currentMenuStateMap);
					break;
				case "FontSize":
					openControl("FontSize", currentMenuStateMap);
					break;
				case "Bold":
					applyStyleChange({
						items: selectedItems,
						styleData: {
							fontWeight:
								currentMenuStateMap.Bold === "Active" ? "normal" : "bold",
						},
					});
					break;
				case "FontColor":
					openControl("FontColor", currentMenuStateMap);
					break;
				case "Alignment":
					openControl("Alignment", currentMenuStateMap);
					break;
			}
		};

	const onBgColorChange = useCallback(
		(bgColor: string) => {
			applyStyleChange({ items: selectedItems, styleData: { fill: bgColor } });
		},
		[selectedItems, applyStyleChange],
	);

	const onBorderColorChange = useCallback(
		(borderColor: string) => {
			applyStyleChange({
				items: selectedItems,
				styleData: { stroke: borderColor },
			});
		},
		[selectedItems, applyStyleChange],
	);

	const onBorderRadiusChange = useCallback(
		(borderRadius: number) => {
			applyStyleChange({
				items: selectedItems,
				styleData: { cornerRadius: borderRadius },
			});
		},
		[selectedItems, applyStyleChange],
	);

	const onFontSizeChange = useCallback(
		(fontSize: number) => {
			applyStyleChange({ items: selectedItems, styleData: { fontSize } });
		},
		[selectedItems, applyStyleChange],
	);

	const onFontColorChange = useCallback(
		(fontColor: string) => {
			applyStyleChange({ items: selectedItems, styleData: { fontColor } });
		},
		[selectedItems, applyStyleChange],
	);

	// If the diagram menu is not shown, close controls.
	useEffect(() => {
		if (!shouldRender) {
			setIsBgColorPickerOpen(false);
			setIsBorderColorPickerOpen(false);
			setIsBorderRadiusSelectorOpen(false);
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
		BgColor: "Hidden",
		BorderColor: "Hidden",
		BorderRadius: "Hidden",
		LineStyle: "Hidden",
		FontSize: "Hidden",
		Bold: "Hidden",
		FontColor: "Hidden",
		Alignment: "Hidden",
	} as DiagramMenuStateMap;

	// Find diagram items for styling
	const firstFillableItem = findFirstFillableRecursive(selectedItems) as
		| FillableData
		| undefined;
	const firstStrokableItem = findFirstStrokableRecursive(selectedItems) as
		| StrokableData
		| undefined;
	const firstCornerRoundableItem = findFirstCornerRoundableRecursive(
		selectedItems,
	) as CornerRoundableData | undefined;
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
	if (firstCornerRoundableItem) {
		menuStateMap.BorderRadius = isBorderRadiusSelectorOpen ? "Active" : "Show";
	}
	if (firstTextableItem) {
		menuStateMap.FontSize = isFontSizeSelectorOpen ? "Active" : "Show";
		menuStateMap.Bold = "Show";
		menuStateMap.FontColor = isFontColorPickerOpen ? "Active" : "Show";
		menuStateMap.Alignment = isAlignmentMenuOpen ? "Active" : "Show";

		if (isTextableState(firstTextableItem)) {
			if (firstTextableItem.fontWeight === "bold") {
				menuStateMap.Bold = "Active";
			}
		}
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

	// Create a section for fillable and strokable items.
	const showFillableAndStrokableSection = showSection(
		"BgColor",
		"BorderColor",
		"BorderRadius",
		"LineStyle",
	);
	if (showFillableAndStrokableSection) {
		menuItemComponents.push(
			<DiagramMenuPositioner key="BgColor">
				<DiagramMenuItem
					menuType="BgColor"
					menuStateMap={menuStateMap}
					onMenuClick={onMenuClick}
				>
					<BgColor title="Background Color" />
				</DiagramMenuItem>
				{menuStateMap.BgColor === "Active" && (
					<ColorPicker
						color={firstFillableItem?.fill || "transparent"}
						onColorChange={onBgColorChange}
					/>
				)}
			</DiagramMenuPositioner>,
		);
		menuItemComponents.push(
			<DiagramMenuPositioner key="BorderColor">
				<DiagramMenuItem
					menuType="BorderColor"
					menuStateMap={menuStateMap}
					onMenuClick={onMenuClick}
				>
					<Edit title="Border Color" />
				</DiagramMenuItem>
				{menuStateMap.BorderColor === "Active" && (
					<ColorPicker
						color={firstStrokableItem?.stroke || "transparent"}
						onColorChange={onBorderColorChange}
					/>
				)}
			</DiagramMenuPositioner>,
		);
		menuItemComponents.push(
			<DiagramMenuPositioner key="BorderRadius">
				<DiagramMenuItem
					menuType="BorderRadius"
					menuStateMap={menuStateMap}
					onMenuClick={onMenuClick}
				>
					<BorderRadius title="Border Radius" />
				</DiagramMenuItem>
				{menuStateMap.BorderRadius === "Active" && (
					<NumberStepper
						value={firstCornerRoundableItem?.cornerRadius || 0}
						min={MIN_BORDER_RADIUS}
						max={MAX_BORDER_RADIUS}
						minusTooltip="Decrease border radius"
						plusTooltip="Increase border radius"
						onChange={onBorderRadiusChange}
					/>
				)}
			</DiagramMenuPositioner>,
		);
		menuItemComponents.push(
			<LineStyleMenu
				key="LineStyle"
				isOpen={isLineStyleMenuOpen}
				onToggle={() => setIsLineStyleMenuOpen(!isLineStyleMenuOpen)}
				selectedDiagrams={selectedItems}
			/>,
		);
		menuItemComponents.push(
			<DiagramMenuDivider key="FillableAndStrokableSectionDivider" />,
		);
	}

	// Create a section for text appearance items.
	const showTextAppearanceSection = showSection(
		"FontSize",
		"FontColor",
		"Bold",
	);
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
			<DiagramMenuItem
				key="Bold"
				menuType="Bold"
				menuStateMap={menuStateMap}
				onMenuClick={onMenuClick}
			>
				<Bold title="Bold" />
			</DiagramMenuItem>,
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
	if (selectedItems.length === 1 && singleSelectedItem) {
		menuItemComponents.push(
			<StackOrderMenu
				key="StackOrder"
				isOpen={isStackOrderMenuOpen}
				onToggle={() => setIsStackOrderMenuOpen(!isStackOrderMenuOpen)}
				selectedDiagram={singleSelectedItem}
			/>,
		);
		menuItemComponents.push(
			<DiagramMenuDivider key="StackOrderSectionDivider" />,
		);
	}

	// Create a section for keep aspect ratio items.
	menuItemComponents.push(
		<KeepAspectRatioMenu
			key="KeepAspectRatio"
			multiSelectGroup={canvasProps.multiSelectGroup}
			singleSelectedItem={singleSelectedItem}
			selectedItems={selectedItems}
		/>,
	);
	menuItemComponents.push(
		<DiagramMenuDivider key="KeepAspectRatioSectionDivider" />,
	);

	// Create a section for group and ungroup items.
	menuItemComponents.push(
		<GroupMenu
			key="Group"
			multiSelectGroup={canvasProps.multiSelectGroup}
			singleSelectedItem={singleSelectedItem}
		/>,
	);
	menuItemComponents.push(<DiagramMenuDivider key="GroupSectionDivider" />);

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
