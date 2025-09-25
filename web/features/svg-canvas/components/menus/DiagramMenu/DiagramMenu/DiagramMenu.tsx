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
	findFirstStrokableRecursive,
	findFirstTextableRecursive,
} from "./DiagramMenuUtils";
import { InteractionState } from "../../../../canvas/types/InteractionState";
import { DISTANCE_FROM_DIAGRAM } from "../../../../constants/styling/menus/DiagramMenuStyling";
import type { RectangleVertices } from "../../../../types/core/RectangleVertices";
import type { CornerRoundableData } from "../../../../types/data/core/CornerRoundableData";
import type { FillableData } from "../../../../types/data/core/FillableData";
import type { StrokableData } from "../../../../types/data/core/StrokableData";
import type { TextableData } from "../../../../types/data/core/TextableData";
import type { DiagramStyleChangeEvent } from "../../../../types/events/DiagramStyleChangeEvent";
import type { Diagram } from "../../../../types/state/core/Diagram";
import { getSelectedDiagrams } from "../../../../utils/core/getSelectedDiagrams";
import { newEventId } from "../../../../utils/core/newEventId";
import { calcRectangleVertices } from "../../../../utils/math/geometry/calcRectangleVertices";
import { isFrame } from "../../../../utils/validation/isFrame";
import { isItemableState } from "../../../../utils/validation/isItemableState";
import { isTextableState } from "../../../../utils/validation/isTextableState";
import { isTransformativeState } from "../../../../utils/validation/isTransformativeState";
import { AlignCenter } from "../../../icons/AlignCenter";
import { AlignLeft } from "../../../icons/AlignLeft";
import { AlignRight } from "../../../icons/AlignRight";
import { AspectRatio } from "../../../icons/AspectRatio";
import { BgColor } from "../../../icons/BgColor";
import { Bold } from "../../../icons/Bold";
import { BorderRadius } from "../../../icons/BorderRadius";
import { BringForward } from "../../../icons/BringForward";
import { BringToFront } from "../../../icons/BringToFront";
import { Edit } from "../../../icons/Edit";
import { FontColor } from "../../../icons/FontColor";
import { FontSize } from "../../../icons/FontSize";
import { Group } from "../../../icons/Group";
import { SendBackward } from "../../../icons/SendBackward";
import { SendToBack } from "../../../icons/SendToBack";
import { VerticalAlignBottom } from "../../../icons/VerticalAlignBottom";
import { VerticalAlignMiddle } from "../../../icons/VerticalAlignMiddle";
import { VerticalAlignTop } from "../../../icons/VerticalAlignTop";
import { ColorPicker } from "../ColorPicker";
import { DiagramMenuItem } from "../DiagramMenuItem";
import { NumberStepper } from "../NumberStepper";

const DiagramMenuComponent: React.FC<DiagramMenuProps> = ({
	canvasProps,
	containerWidth,
	containerHeight,
}) => {
	// Extract properties from canvasProps.
	const { items, interactionState, multiSelectGroup, zoom, minX, minY } =
		canvasProps;

	const menuRef = useRef<HTMLDivElement>(null);
	const [previousSelectedItemsId, setPreviousSelectedItemsId] =
		useState<string>("");
	const [menuDimensions, setMenuDimensions] = useState({
		width: 0,
		height: 40,
	});

	// Diagram menu controls open/close state.
	const [isBgColorPickerOpen, setIsBgColorPickerOpen] = useState(false);
	const [isBorderColorPickerOpen, setIsBorderColorPickerOpen] = useState(false);
	const [isBorderRadiusSelectorOpen, setIsBorderRadiusSelectorOpen] =
		useState(false);
	const [isFontSizeSelectorOpen, setIsFontSizeSelectorOpen] = useState(false);
	const [isFontColorPickerOpen, setIsFontColorPickerOpen] = useState(false);

	// Get selected items and check if the diagram menu should be shown.
	const selectedItems = getSelectedDiagrams(items);
	const showDiagramMenu =
		selectedItems.length > 0 && interactionState === InteractionState.Idle;
	const singleSelectedItem = selectedItems[0];
	// Create selected items ID string for dependency tracking
	const selectedItemsId = selectedItems.map((item) => item.id).join(",");

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

	const changeItemsStyle = useCallback(
		(
			items: Diagram[],
			styleData: Partial<Omit<DiagramStyleChangeEvent, "eventId" | "id">>,
			recursively = true,
			eventId: string = newEventId(),
		) => {
			for (const item of items) {
				canvasProps.onStyleChange?.({
					eventId,
					id: item.id,
					...styleData,
				});

				if (recursively && isItemableState(item)) {
					changeItemsStyle(item.items, styleData, recursively, eventId);
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
				FontSize: false,
				FontColor: false,
			} as {
				[key in DiagramMenuType]: boolean;
			};

			// Check current state to determine if we should open the control
			const shouldOpen = currentMenuStateMap[menuType] === "Show";
			newControlsStateMap[menuType] = shouldOpen;

			setIsBgColorPickerOpen(newControlsStateMap.BgColor);
			setIsBorderColorPickerOpen(newControlsStateMap.BorderColor);
			setIsBorderRadiusSelectorOpen(newControlsStateMap.BorderRadius);
			setIsFontSizeSelectorOpen(newControlsStateMap.FontSize);
			setIsFontColorPickerOpen(newControlsStateMap.FontColor);
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
				case "FontSize":
					openControl("FontSize", currentMenuStateMap);
					break;
				case "Bold":
					changeItemsStyle(selectedItems, {
						fontWeight:
							currentMenuStateMap.Bold === "Active" ? "normal" : "bold",
					});
					break;
				case "FontColor":
					openControl("FontColor", currentMenuStateMap);
					break;
				case "AlignLeft":
					changeItemsStyle(selectedItems, { textAlign: "left" });
					break;
				case "AlignCenter":
					changeItemsStyle(selectedItems, { textAlign: "center" });
					break;
				case "AlignRight":
					changeItemsStyle(selectedItems, { textAlign: "right" });
					break;
				case "AlignTop":
					changeItemsStyle(selectedItems, { verticalAlign: "top" });
					break;
				case "AlignMiddle":
					changeItemsStyle(selectedItems, { verticalAlign: "center" });
					break;
				case "AlignBottom":
					changeItemsStyle(selectedItems, { verticalAlign: "bottom" });
					break;
				case "BringToFront":
					if (singleSelectedItem) {
						canvasProps.onStackOrderChange?.({
							eventId: newEventId(),
							changeType: "bringToFront",
							id: singleSelectedItem.id,
						});
					}
					break;
				case "BringForward":
					if (singleSelectedItem) {
						canvasProps.onStackOrderChange?.({
							eventId: newEventId(),
							changeType: "bringForward",
							id: singleSelectedItem.id,
						});
					}
					break;
				case "SendBackward":
					if (singleSelectedItem) {
						canvasProps.onStackOrderChange?.({
							eventId: newEventId(),
							changeType: "sendBackward",
							id: singleSelectedItem.id,
						});
					}
					break;
				case "SendToBack":
					if (singleSelectedItem) {
						canvasProps.onStackOrderChange?.({
							eventId: newEventId(),
							changeType: "sendToBack",
							id: singleSelectedItem.id,
						});
					}
					break;
				case "KeepAspectRatio":
					if (multiSelectGroup) {
						canvasProps.onConstraintChange?.({
							eventId: newEventId(),
							id: multiSelectGroup.id,
							keepProportion: currentMenuStateMap.KeepAspectRatio !== "Active",
						});
					} else {
						for (const item of selectedItems) {
							canvasProps.onConstraintChange?.({
								eventId: newEventId(),
								id: item.id,
								keepProportion:
									currentMenuStateMap.KeepAspectRatio !== "Active",
							});
						}
					}
					break;
				case "Group":
					if (currentMenuStateMap.Group === "Show") {
						canvasProps.onGroup?.();
					}
					if (currentMenuStateMap.Group === "Active") {
						canvasProps.onUngroup?.();
					}
					break;
			}
		};

	const onBgColorChange = useCallback(
		(bgColor: string) => {
			changeItemsStyle(selectedItems, { fill: bgColor });
		},
		[selectedItems, changeItemsStyle],
	);

	const onBorderColorChange = useCallback(
		(borderColor: string) => {
			changeItemsStyle(selectedItems, { stroke: borderColor });
		},
		[selectedItems, changeItemsStyle],
	);

	const onBorderRadiusChange = useCallback(
		(borderRadius: number) => {
			changeItemsStyle(selectedItems, { cornerRadius: borderRadius });
		},
		[selectedItems, changeItemsStyle],
	);

	const onFontSizeChange = useCallback(
		(fontSize: number) => {
			changeItemsStyle(selectedItems, { fontSize });
		},
		[selectedItems, changeItemsStyle],
	);

	const onFontColorChange = useCallback(
		(fontColor: string) => {
			changeItemsStyle(selectedItems, { fontColor });
		},
		[selectedItems, changeItemsStyle],
	);

	// If the diagram menu is not shown, close controls.
	useEffect(() => {
		if (!showDiagramMenu) {
			setIsBgColorPickerOpen(false);
			setIsBorderColorPickerOpen(false);
			setIsBorderRadiusSelectorOpen(false);
			setIsFontSizeSelectorOpen(false);
			setIsFontColorPickerOpen(false);
		}
	}, [showDiagramMenu]);

	// Update menu dimensions when DOM changes or selected items change
	useEffect(() => {
		if (menuRef.current && showDiagramMenu) {
			const rect = menuRef.current.getBoundingClientRect();
			setMenuDimensions({ width: rect.width, height: rect.height });
		}
		// Update the state for tracking
		setPreviousSelectedItemsId(selectedItemsId);
	}, [showDiagramMenu, selectedItemsId]);

	if (!showDiagramMenu) return null;

	// Default menu state map.
	const menuStateMap = {
		BgColor: "Hidden",
		BorderColor: "Hidden",
		BorderRadius: "Hidden",
		FontSize: "Hidden",
		Bold: "Hidden",
		FontColor: "Hidden",
		AlignLeft: "Hidden",
		AlignCenter: "Hidden",
		AlignRight: "Hidden",
		AlignTop: "Hidden",
		AlignMiddle: "Hidden",
		AlignBottom: "Hidden",
		BringToFront: "Hidden",
		BringForward: "Hidden",
		SendBackward: "Hidden",
		SendToBack: "Hidden",
		KeepAspectRatio: "Hidden",
		Group: "Hidden",
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

	// Set menu state based on selected items
	if (firstFillableItem) {
		menuStateMap.BgColor = isBgColorPickerOpen ? "Active" : "Show";
	}
	if (firstStrokableItem) {
		menuStateMap.BorderColor = isBorderColorPickerOpen ? "Active" : "Show";
	}
	if (firstCornerRoundableItem) {
		menuStateMap.BorderRadius = isBorderRadiusSelectorOpen ? "Active" : "Show";
	}
	if (firstTextableItem) {
		menuStateMap.FontSize = isFontSizeSelectorOpen ? "Active" : "Show";
		menuStateMap.Bold = "Show";
		menuStateMap.FontColor = isFontColorPickerOpen ? "Active" : "Show";
		menuStateMap.AlignLeft = "Show";
		menuStateMap.AlignCenter = "Show";
		menuStateMap.AlignRight = "Show";
		menuStateMap.AlignTop = "Show";
		menuStateMap.AlignMiddle = "Show";
		menuStateMap.AlignBottom = "Show";

		if (isTextableState(firstTextableItem)) {
			if (firstTextableItem.fontWeight === "bold") {
				menuStateMap.Bold = "Active";
			}
			if (firstTextableItem.textAlign === "left") {
				menuStateMap.AlignLeft = "Active";
			}
			if (firstTextableItem.textAlign === "center") {
				menuStateMap.AlignCenter = "Active";
			}
			if (firstTextableItem.textAlign === "right") {
				menuStateMap.AlignRight = "Active";
			}
			if (firstTextableItem.verticalAlign === "top") {
				menuStateMap.AlignTop = "Active";
			}
			if (firstTextableItem.verticalAlign === "center") {
				menuStateMap.AlignMiddle = "Active";
			}
			if (firstTextableItem.verticalAlign === "bottom") {
				menuStateMap.AlignBottom = "Active";
			}
		}
	}

	// Set other menu states
	if (selectedItems.length === 1) {
		menuStateMap.BringToFront = "Show";
		menuStateMap.SendToBack = "Show";
		menuStateMap.BringForward = "Show";
		menuStateMap.SendBackward = "Show";
	}

	// Set the keep aspect ratio state.
	if (multiSelectGroup) {
		menuStateMap.KeepAspectRatio = multiSelectGroup.keepProportion
			? "Active"
			: "Show";
	} else if (isTransformativeState(singleSelectedItem)) {
		menuStateMap.KeepAspectRatio = singleSelectedItem.keepProportion
			? "Active"
			: "Show";
	}

	// Set the group menu state.
	if (multiSelectGroup) {
		menuStateMap.Group = "Show";
	} else if (singleSelectedItem && singleSelectedItem.type === "Group") {
		menuStateMap.Group = "Active";
	}

	// Get diagram position and size
	let x, y, width, height, rotation, scaleX, scaleY;
	if (multiSelectGroup) {
		({ x, y, width, height, rotation, scaleX, scaleY } = multiSelectGroup);
	} else if (isFrame(singleSelectedItem)) {
		({ x, y, width, height, rotation, scaleX, scaleY } = singleSelectedItem);
	} else {
		// Default values if no transformative item
		x = y = width = height = 0;
		rotation = 0;
		scaleX = scaleY = 1;
	}

	const vertices = calcRectangleVertices({
		x: x * zoom,
		y: y * zoom,
		width: width * zoom,
		height: height * zoom,
		rotation,
		scaleX,
		scaleY,
	});

	// Get diagram bottom Y position
	const diagramBottomY = Object.keys(vertices).reduce((max, key) => {
		const vertex = vertices[key as keyof RectangleVertices];
		return Math.max(max, vertex.y);
	}, Number.NEGATIVE_INFINITY);

	// Get diagram center X position
	const diagramCenterX = x * zoom;

	// Calculate menu position with viewport constraints
	const calculateMenuPosition = (): { x: number; y: number } => {
		const menuWidth = menuDimensions.width;
		const menuHeight = menuDimensions.height;

		// Default position: below the diagram, centered
		let menuX = diagramCenterX - menuWidth / 2;
		let menuY = diagramBottomY + DISTANCE_FROM_DIAGRAM;

		// Check if menu overflows viewport horizontally
		const viewportRight = minX + containerWidth;
		if (menuX + menuWidth > viewportRight) {
			// Adjust to fit within right boundary
			menuX = viewportRight - menuWidth;
		}
		if (menuX < minX) {
			// Adjust to fit within left boundary
			menuX = minX;
		}

		// Check if menu overflows viewport vertically (bottom)
		const viewportBottom = minY + containerHeight;
		if (menuY + menuHeight > viewportBottom) {
			// Position above the diagram
			const diagramTopY = Object.keys(vertices).reduce((min, key) => {
				const vertex = vertices[key as keyof RectangleVertices];
				return Math.min(min, vertex.y);
			}, Number.POSITIVE_INFINITY);
			menuY = diagramTopY - DISTANCE_FROM_DIAGRAM - menuHeight;
		}

		// Ensure menu doesn't go above viewport
		if (menuY < minY) {
			menuY = minY;
		}

		return { x: menuX, y: menuY };
	};

	const menuPosition = calculateMenuPosition();

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

	// Create a section for text alignment items.
	const showTextAlignmentSection = showSection(
		"AlignLeft",
		"AlignCenter",
		"AlignRight",
	);
	if (showTextAlignmentSection) {
		menuItemComponents.push(
			<DiagramMenuItem
				key="AlignLeft"
				menuType="AlignLeft"
				menuStateMap={menuStateMap}
				onMenuClick={onMenuClick}
			>
				<AlignLeft title="Align Left" />
			</DiagramMenuItem>,
		);
		menuItemComponents.push(
			<DiagramMenuItem
				key="AlignCenter"
				menuType="AlignCenter"
				menuStateMap={menuStateMap}
				onMenuClick={onMenuClick}
			>
				<AlignCenter title="Align Center" />
			</DiagramMenuItem>,
		);
		menuItemComponents.push(
			<DiagramMenuItem
				key="AlignRight"
				menuType="AlignRight"
				menuStateMap={menuStateMap}
				onMenuClick={onMenuClick}
			>
				<AlignRight title="Align Right" />
			</DiagramMenuItem>,
		);
		menuItemComponents.push(
			<DiagramMenuDivider key="TextAlignmentSectionDivider" />,
		);
	}

	// Create a section for text vertical alignment items.
	const showTextVerticalAlignmentSection = showSection(
		"AlignTop",
		"AlignMiddle",
		"AlignBottom",
	);
	if (showTextVerticalAlignmentSection) {
		menuItemComponents.push(
			<DiagramMenuItem
				key="AlignTop"
				menuType="AlignTop"
				menuStateMap={menuStateMap}
				onMenuClick={onMenuClick}
			>
				<VerticalAlignTop title="Align Top" />
			</DiagramMenuItem>,
		);
		menuItemComponents.push(
			<DiagramMenuItem
				key="AlignMiddle"
				menuType="AlignMiddle"
				menuStateMap={menuStateMap}
				onMenuClick={onMenuClick}
			>
				<VerticalAlignMiddle title="Align Middle" />
			</DiagramMenuItem>,
		);
		menuItemComponents.push(
			<DiagramMenuItem
				key="AlignBottom"
				menuType="AlignBottom"
				menuStateMap={menuStateMap}
				onMenuClick={onMenuClick}
			>
				<VerticalAlignBottom title="Align Bottom" />
			</DiagramMenuItem>,
		);
		menuItemComponents.push(
			<DiagramMenuDivider key="TextVerticalAlignmentSectionDivider" />,
		);
	}

	// Create a section for bring to front and send to back items.
	const showBringToFrontSection = showSection(
		"BringToFront",
		"BringForward",
		"SendBackward",
		"SendToBack",
	);
	if (showBringToFrontSection) {
		menuItemComponents.push(
			<DiagramMenuItem
				key="BringToFront"
				menuType="BringToFront"
				menuStateMap={menuStateMap}
				onMenuClick={onMenuClick}
			>
				<BringToFront title="Bring to Front" />
			</DiagramMenuItem>,
		);
		menuItemComponents.push(
			<DiagramMenuItem
				key="BringForward"
				menuType="BringForward"
				menuStateMap={menuStateMap}
				onMenuClick={onMenuClick}
			>
				<BringForward title="Bring Forward" />
			</DiagramMenuItem>,
		);
		menuItemComponents.push(
			<DiagramMenuItem
				key="SendBackward"
				menuType="SendBackward"
				menuStateMap={menuStateMap}
				onMenuClick={onMenuClick}
			>
				<SendBackward title="Send Backward" />
			</DiagramMenuItem>,
		);
		menuItemComponents.push(
			<DiagramMenuItem
				key="SendToBack"
				menuType="SendToBack"
				menuStateMap={menuStateMap}
				onMenuClick={onMenuClick}
			>
				<SendToBack title="Send to Back" />
			</DiagramMenuItem>,
		);
		menuItemComponents.push(
			<DiagramMenuDivider key="BringToFrontSectionDivider" />,
		);
	}

	// Create a section for keep aspect ratio items.
	const showKeepAspectRatioSection = showSection("KeepAspectRatio");
	if (showKeepAspectRatioSection) {
		menuItemComponents.push(
			<DiagramMenuItem
				key="KeepAspectRatio"
				menuType="KeepAspectRatio"
				menuStateMap={menuStateMap}
				onMenuClick={onMenuClick}
			>
				<AspectRatio width={22} height={22} title="Keep Aspect Ratio" />
			</DiagramMenuItem>,
		);
		menuItemComponents.push(
			<DiagramMenuDivider key="KeepAspectRatioSectionDivider" />,
		);
	}

	// Create a section for group and ungroup items.
	const showGroupSection = showSection("Group");
	if (showGroupSection) {
		menuItemComponents.push(
			<DiagramMenuItem
				key="Group"
				menuType="Group"
				menuStateMap={menuStateMap}
				onMenuClick={onMenuClick}
			>
				<Group title={menuStateMap.Group === "Active" ? "Ungroup" : "Group"} />
			</DiagramMenuItem>,
		);
		menuItemComponents.push(<DiagramMenuDivider key="GroupSectionDivider" />);
	}

	// Remove the last divider.
	menuItemComponents.pop();

	// Check if selected items have changed to control z-index
	const isItemsChanged = previousSelectedItemsId !== selectedItemsId;

	return (
		<DiagramMenuWrapper
			x={menuPosition.x}
			y={menuPosition.y}
			zIndex={isItemsChanged ? -1 : 1060}
		>
			<DiagramMenuDiv ref={menuRef}>
				{menuItemComponents.map((component) => component)}
			</DiagramMenuDiv>
		</DiagramMenuWrapper>
	);
};

export const DiagramMenu = memo(DiagramMenuComponent);
