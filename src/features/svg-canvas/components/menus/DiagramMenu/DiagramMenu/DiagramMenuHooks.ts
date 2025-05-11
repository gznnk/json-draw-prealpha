// Import React.
import { useCallback, useEffect, useRef, useState } from "react";

// TODO: 場所
import { getSelectedItems } from "../../../../canvas/SvgCanvasFunctions";

// Import types related to SvgCanvas.
import type { SvgCanvasProps } from "../../../../canvas/SvgCanvasTypes";
import type { Diagram } from "../../../../catalog";
import type { FillableData, StrokableData } from "../../../../types/core";
import type { TextableData } from "../../../../types/core";
import type { RectangleData } from "../../../shapes/Rectangle";

// Import functions related to SvgCanvas.
import {
	isItemableData,
	isTextableData,
	isTransformativeData,
} from "../../../../utils";
import { newEventId } from "../../../../utils";

// Imports related to this component.
import {
	findFirstBorderRadiusRecursive,
	findFirstFillableRecursive,
	findFirstStrokableRecursive,
	findFirstTextableRecursive,
} from "./DiagramMenuFunctions";
import type {
	DiagramMenuProps,
	DiagramMenuStateMap,
	DiagramMenuType,
} from "./DiagramMenuTypes";

export const useDiagramMenu = (canvasProps: SvgCanvasProps) => {
	// Extract properties from canvasProps.
	const { items, isDiagramChanging, multiSelectGroup } = canvasProps;

	// Diagram menu controls open/close state.
	const [isBgColorPickerOpen, setIsBgColorPickerOpen] = useState(false);
	const [isBorderColorPickerOpen, setIsBorderColorPickerOpen] = useState(false);
	const [isBorderRadiusSelectorOpen, setIsBorderRadiusSelectorOpen] =
		useState(false);
	const [isFontSizeSelectorOpen, setIsFontSizeSelectorOpen] = useState(false);
	const [isFontColorPickerOpen, setIsFontColorPickerOpen] = useState(false);

	// Default menu props (invisible).
	let diagramMenuProps = {
		isVisible: false,
	} as DiagramMenuProps;

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

	// Get selected items and check if the diagram menu should be shown.
	const selectedItems = getSelectedItems(items);
	const showDiagramMenu = 0 < selectedItems.length && !isDiagramChanging;
	const singleSelectedItem = selectedItems[0];

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

	// If the diagram menu should be shown, set the properties for the menu.
	if (showDiagramMenu) {
		// Find the first fillable item in the selected items.
		// This is used to determine the background color menu state.
		const firstFillableItem = findFirstFillableRecursive(selectedItems) as
			| FillableData
			| undefined;
		if (firstFillableItem) {
			menuStateMap.BgColor = "Show";

			if (isBgColorPickerOpen) {
				menuStateMap.BgColor = "Active";
			}
		}

		// Find the first strokable item in the selected items.
		// This is used to determine the border color menu state.
		const firstStrokableItem = findFirstStrokableRecursive(selectedItems) as
			| StrokableData
			| undefined;
		if (firstStrokableItem) {
			menuStateMap.BorderColor = "Show";

			if (isBorderColorPickerOpen) {
				menuStateMap.BorderColor = "Active";
			}
		}

		// Find the first border radius item in the selected items.
		// This is used to determine the border radius menu state.
		const firstRectangleItem = findFirstBorderRadiusRecursive(selectedItems) as
			| RectangleData
			| undefined;
		if (firstRectangleItem) {
			menuStateMap.BorderRadius = "Show";

			if (isBorderRadiusSelectorOpen) {
				menuStateMap.BorderRadius = "Active";
			}
		}

		// Find the first textable item in the selected items.
		// This is used to determine the font size and other text-related properties.
		const firstTextableItem = findFirstTextableRecursive(selectedItems) as
			| TextableData
			| undefined;

		// When a textable item is selected, show the text-related menu items.
		if (firstTextableItem) {
			menuStateMap.FontSize = "Show";
			menuStateMap.Bold = "Show";
			menuStateMap.FontColor = "Show";
			menuStateMap.AlignLeft = "Show";
			menuStateMap.AlignCenter = "Show";
			menuStateMap.AlignRight = "Show";
			menuStateMap.AlignTop = "Show";
			menuStateMap.AlignMiddle = "Show";
			menuStateMap.AlignBottom = "Show";

			if (isFontSizeSelectorOpen) {
				menuStateMap.FontSize = "Active";
			}

			if (isFontColorPickerOpen) {
				menuStateMap.FontColor = "Active";
			}

			if (isTextableData(firstTextableItem)) {
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

		// Set the bring to front and send to back menu states.
		if (selectedItems.length === 1) {
			// When a single item is selected, show the bring to front and send to back menu items.
			menuStateMap.BringToFront = "Show";
			menuStateMap.SendToBack = "Show";
			menuStateMap.BringForward = "Show";
			menuStateMap.SendBackward = "Show";
		}

		// Set the keep aspect ratio state.
		if (multiSelectGroup) {
			// Indicates this the condition is for multiple selection.
			// When multiple items are selected, use the multiSelectGroup properties.
			menuStateMap.KeepAspectRatio = multiSelectGroup.keepProportion
				? "Active"
				: "Show";
		} else if (isTransformativeData(singleSelectedItem)) {
			menuStateMap.KeepAspectRatio = singleSelectedItem.keepProportion
				? "Active"
				: "Show";
		}

		// Set the group menu state.
		if (multiSelectGroup) {
			// Indicates this the condition is for multiple selection.
			// When multiple items are selected, activate the group menu to group the selected items.
			menuStateMap.Group = "Show";
		} else if (singleSelectedItem.type === "Group") {
			menuStateMap.Group = "Active";
		}

		if (multiSelectGroup) {
			// Indicates this the condition is for multiple selection.
			// When multiple items are selected, use the multiSelectGroup properties.
			const { x, y, width, height, rotation, scaleX, scaleY } =
				multiSelectGroup;
			diagramMenuProps = {
				x,
				y,
				width,
				height,
				rotation,
				scaleX,
				scaleY,
				isVisible: true,
				menuStateMap,
				bgColor: firstFillableItem?.fill || "transparent",
				borderColor: firstStrokableItem?.stroke || "transparent",
				borderRadius: firstRectangleItem?.radius || 0,
				fontSize: firstTextableItem?.fontSize || 0,
				fontColor: firstTextableItem?.fontColor || "transparent",
			} as DiagramMenuProps;
		} else {
			// When a single item is selected, use the properties of the selected item.
			if (isTransformativeData(singleSelectedItem)) {
				diagramMenuProps = {
					x: singleSelectedItem.x,
					y: singleSelectedItem.y,
					width: singleSelectedItem.width,
					height: singleSelectedItem.height,
					rotation: singleSelectedItem.rotation,
					scaleX: singleSelectedItem.scaleX,
					scaleY: singleSelectedItem.scaleY,
					isVisible: true,
					menuStateMap,
					bgColor: firstFillableItem?.fill || "transparent",
					borderColor: firstStrokableItem?.stroke || "transparent",
					borderRadius: firstRectangleItem?.radius || 0,
					fontSize: firstTextableItem?.fontSize ?? 0,
					fontColor: firstTextableItem?.fontColor || "transparent",
				} as DiagramMenuProps;
			}
		}
	}

	const changeItems = (
		items: Diagram[],
		data: Partial<Diagram>,
		recursively = true,
		eventId: string = newEventId(),
	) => {
		for (const item of items) {
			// Apply the changes to the item.
			const newItem = { ...item };
			for (const key of Object.keys(data) as (keyof Diagram)[]) {
				if (key in newItem) {
					(newItem[key] as (typeof data)[keyof Diagram]) = data[key];
				}
			}

			// Trigger the change event.
			canvasProps.onDiagramChange?.({
				eventId,
				eventType: "Instant", // TODO: 履歴に保存されない
				changeType: "Appearance",
				id: item.id,
				startDiagram: item,
				endDiagram: newItem,
			});

			if (recursively && isItemableData(newItem)) {
				// Check if the item has children and recursively change their properties.
				changeItems(newItem.items, data, recursively, eventId);
			}
		}
	};

	const openControl = (menuType: DiagramMenuType) => {
		const newControlsStateMap = {
			BgColor: false,
			BorderColor: false,
			BorderRadius: false,
			FontSize: false,
			FontColor: false,
		} as {
			[key in DiagramMenuType]: boolean;
		};
		newControlsStateMap[menuType] = menuStateMap[menuType] === "Show";

		setIsBgColorPickerOpen(newControlsStateMap.BgColor);
		setIsBorderColorPickerOpen(newControlsStateMap.BorderColor);
		setIsBorderRadiusSelectorOpen(newControlsStateMap.BorderRadius);
		setIsFontSizeSelectorOpen(newControlsStateMap.FontSize);
		setIsFontColorPickerOpen(newControlsStateMap.FontColor);
	};

	// Create references bypass to avoid function creation in every render.
	const refBusVal = {
		// Component properties
		canvasProps,
		// Internal variables and functions
		selectedItems,
		menuStateMap,
		singleSelectedItem,
		changeItems,
		openControl,
	};
	const refBus = useRef(refBusVal);
	refBus.current = refBusVal;

	diagramMenuProps.onMenuClick = useCallback((menuType: string) => {
		// Bypass references to avoid function creation in every render.
		const {
			canvasProps: {
				multiSelectGroup,
				onDiagramChange,
				onGroup,
				onUngroup,
				onStackOrderChange,
			},
			selectedItems,
			menuStateMap,
			singleSelectedItem,
			changeItems,
			openControl,
		} = refBus.current;

		switch (menuType) {
			case "BgColor":
				openControl("BgColor");
				break;
			case "BorderColor":
				openControl("BorderColor");
				break;
			case "BorderRadius":
				openControl("BorderRadius");
				break;
			case "FontSize":
				openControl("FontSize");
				break;
			case "Bold":
				changeItems(selectedItems, {
					fontWeight: menuStateMap.Bold === "Active" ? "normal" : "bold",
				});
				break;
			case "FontColor":
				openControl("FontColor");
				break;
			case "AlignLeft":
				changeItems(selectedItems, {
					textAlign: "left",
				});
				break;
			case "AlignCenter":
				changeItems(selectedItems, {
					textAlign: "center",
				});
				break;
			case "AlignRight":
				changeItems(selectedItems, {
					textAlign: "right",
				});
				break;
			case "AlignTop":
				changeItems(selectedItems, {
					verticalAlign: "top",
				});
				break;
			case "AlignMiddle":
				changeItems(selectedItems, {
					verticalAlign: "center",
				});
				break;
			case "AlignBottom":
				changeItems(selectedItems, {
					verticalAlign: "bottom",
				});
				break;
			case "BringToFront":
				onStackOrderChange?.({
					changeType: "bringToFront",
					id: singleSelectedItem.id,
				});
				break;
			case "BringForward":
				onStackOrderChange?.({
					changeType: "bringForward",
					id: singleSelectedItem.id,
				});
				break;
			case "SendBackward":
				onStackOrderChange?.({
					changeType: "sendBackward",
					id: singleSelectedItem.id,
				});
				break;
			case "SendToBack":
				onStackOrderChange?.({
					changeType: "sendToBack",
					id: singleSelectedItem.id,
				});
				break;
			case "KeepAspectRatio":
				if (multiSelectGroup) {
					onDiagramChange?.({
						eventId: newEventId(),
						eventType: "Instant",
						changeType: "Appearance",
						id: multiSelectGroup.id,
						startDiagram: multiSelectGroup,
						endDiagram: {
							keepProportion: menuStateMap.KeepAspectRatio !== "Active",
						},
					});
				} else {
					changeItems(
						selectedItems,
						{
							keepProportion: menuStateMap.KeepAspectRatio !== "Active",
						},
						false,
					);
				}
				break;
			case "Group":
				if (menuStateMap.Group === "Show") {
					onGroup?.();
				}
				if (menuStateMap.Group === "Active") {
					onUngroup?.();
				}
				break;
		}
	}, []);

	diagramMenuProps.onBorderColorChange = useCallback((borderColor: string) => {
		// Bypass references to avoid function creation in every render.
		const { selectedItems, changeItems } = refBus.current;

		changeItems(selectedItems, {
			stroke: borderColor,
		});
	}, []);

	diagramMenuProps.onBgColorChange = useCallback((bgColor: string) => {
		// Bypass references to avoid function creation in every render.
		const { selectedItems, changeItems } = refBus.current;

		changeItems(selectedItems, {
			fill: bgColor,
		});
	}, []);

	diagramMenuProps.onBorderRadiusChange = useCallback(
		(borderRadius: number) => {
			// Bypass references to avoid function creation in every render.
			const { selectedItems, changeItems } = refBus.current;

			changeItems(selectedItems, {
				radius: borderRadius,
			});
		},
		[],
	);

	diagramMenuProps.onFontSizeChange = useCallback((fontSize: number) => {
		// Bypass references to avoid function creation in every render.
		const { selectedItems, changeItems } = refBus.current;

		changeItems(selectedItems, {
			fontSize,
		});
	}, []);

	diagramMenuProps.onFontColorChange = useCallback((fontColor: string) => {
		// Bypass references to avoid function creation in every render.
		const { selectedItems, changeItems } = refBus.current;

		changeItems(selectedItems, {
			fontColor,
		});
	}, []);

	return {
		diagramMenuProps,
	};
};
