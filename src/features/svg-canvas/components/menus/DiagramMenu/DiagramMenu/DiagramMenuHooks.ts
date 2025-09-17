// Import React.
import { useCallback, useEffect, useRef, useState } from "react";

// Import types.
import type { SvgCanvasProps } from "../../../../canvas/types/SvgCanvasProps";
import type { CornerRoundableData } from "../../../../types/data/core/CornerRoundableData";
import type { FillableData } from "../../../../types/data/core/FillableData";
import type { StrokableData } from "../../../../types/data/core/StrokableData";
import type { TextableData } from "../../../../types/data/core/TextableData";

import type { DiagramStyleChangeEvent } from "../../../../types/events/DiagramStyleChangeEvent";
import type { Diagram } from "../../../../types/state/core/Diagram";

// Import utils.
import { getSelectedDiagrams } from "../../../../utils/core/getSelectedDiagrams";
import { newEventId } from "../../../../utils/core/newEventId";
import { isItemableState } from "../../../../utils/validation/isItemableState";
import { isTextableState } from "../../../../utils/validation/isTextableState";
import { isTransformativeState } from "../../../../utils/validation/isTransformativeState";

// Imports related to this component.
import { InteractionState } from "../../../../canvas/types/InteractionState";
import {
	findFirstCornerRoundableRecursive,
	findFirstFillableRecursive,
	findFirstStrokableRecursive,
	findFirstTextableRecursive,
} from "./DiagramMenuUtils";
import type {
	DiagramMenuProps,
	DiagramMenuStateMap,
	DiagramMenuType,
} from "./DiagramMenuTypes";

export const useDiagramMenu = (canvasProps: SvgCanvasProps) => {
	// Extract properties from canvasProps.
	const { items, interactionState, multiSelectGroup, zoom } = canvasProps;

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
	const selectedItems = getSelectedDiagrams(items);
	const showDiagramMenu =
		0 < selectedItems.length && interactionState === InteractionState.Idle;
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
		const firstCornerRoundableItem = findFirstCornerRoundableRecursive(
			selectedItems,
		) as CornerRoundableData | undefined;
		if (firstCornerRoundableItem) {
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
		} else if (isTransformativeState(singleSelectedItem)) {
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
				x: x * zoom,
				y: y * zoom,
				width: width * zoom,
				height: height * zoom,
				rotation,
				scaleX,
				scaleY,
				zoom,
				isVisible: true,
				menuStateMap,
				bgColor: firstFillableItem?.fill || "transparent",
				borderColor: firstStrokableItem?.stroke || "transparent",
				borderRadius: firstCornerRoundableItem?.cornerRadius || 0,
				fontSize: firstTextableItem?.fontSize || 0,
				fontColor: firstTextableItem?.fontColor || "transparent",
			} as DiagramMenuProps;
		} else {
			// When a single item is selected, use the properties of the selected item.
			if (isTransformativeState(singleSelectedItem)) {
				diagramMenuProps = {
					x: singleSelectedItem.x * zoom,
					y: singleSelectedItem.y * zoom,
					width: singleSelectedItem.width * zoom,
					height: singleSelectedItem.height * zoom,
					rotation: singleSelectedItem.rotation,
					scaleX: singleSelectedItem.scaleX,
					scaleY: singleSelectedItem.scaleY,
					zoom,
					isVisible: true,
					menuStateMap,
					bgColor: firstFillableItem?.fill || "transparent",
					borderColor: firstStrokableItem?.stroke || "transparent",
					borderRadius: firstCornerRoundableItem?.cornerRadius || 0,
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
			} // Trigger the change event.
			canvasProps.onDiagramChange?.({
				eventId,
				eventPhase: "Ended", // TODO: Not saved to history
				id: item.id,
				startDiagram: item,
				endDiagram: newItem,
			});

			if (recursively && isItemableState(newItem)) {
				// Check if the item has children and recursively change their properties.
				changeItems(newItem.items, data, recursively, eventId);
			}
		}
	};

	const changeItemsStyle = (
		items: Diagram[],
		styleData: Partial<Omit<DiagramStyleChangeEvent, "eventId" | "id">>,
		recursively = true,
		eventId: string = newEventId(),
	) => {
		for (const item of items) {
			// Trigger the style change event.
			canvasProps.onStyleChange?.({
				eventId,
				id: item.id,
				...styleData,
			});

			if (recursively && isItemableState(item)) {
				// Check if the item has children and recursively change their properties.
				changeItemsStyle(item.items, styleData, recursively, eventId);
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
		changeItemsStyle,
		openControl,
	};
	const refBus = useRef(refBusVal);
	refBus.current = refBusVal;

	diagramMenuProps.onMenuClick = useCallback((menuType: string) => {
		// Bypass references to avoid function creation in every render.
		const {
			canvasProps: {
				multiSelectGroup,
				onConstraintChange,
				onGroup,
				onUngroup,
				onStackOrderChange,
			},
			selectedItems,
			menuStateMap,
			singleSelectedItem,
			changeItemsStyle,
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
				changeItemsStyle(selectedItems, {
					fontWeight: menuStateMap.Bold === "Active" ? "normal" : "bold",
				});
				break;
			case "FontColor":
				openControl("FontColor");
				break;
			case "AlignLeft":
				changeItemsStyle(selectedItems, {
					textAlign: "left",
				});
				break;
			case "AlignCenter":
				changeItemsStyle(selectedItems, {
					textAlign: "center",
				});
				break;
			case "AlignRight":
				changeItemsStyle(selectedItems, {
					textAlign: "right",
				});
				break;
			case "AlignTop":
				changeItemsStyle(selectedItems, {
					verticalAlign: "top",
				});
				break;
			case "AlignMiddle":
				changeItemsStyle(selectedItems, {
					verticalAlign: "center",
				});
				break;
			case "AlignBottom":
				changeItemsStyle(selectedItems, {
					verticalAlign: "bottom",
				});
				break;
			case "BringToFront":
				onStackOrderChange?.({
					eventId: newEventId(),
					changeType: "bringToFront",
					id: singleSelectedItem.id,
				});
				break;
			case "BringForward":
				onStackOrderChange?.({
					eventId: newEventId(),
					changeType: "bringForward",
					id: singleSelectedItem.id,
				});
				break;
			case "SendBackward":
				onStackOrderChange?.({
					eventId: newEventId(),
					changeType: "sendBackward",
					id: singleSelectedItem.id,
				});
				break;
			case "SendToBack":
				onStackOrderChange?.({
					eventId: newEventId(),
					changeType: "sendToBack",
					id: singleSelectedItem.id,
				});
				break;
			case "KeepAspectRatio":
				if (multiSelectGroup) {
					onConstraintChange?.({
						eventId: newEventId(),
						id: multiSelectGroup.id,
						keepProportion: menuStateMap.KeepAspectRatio !== "Active",
					});
				} else {
					// For single item, use the constraint change event
					for (const item of selectedItems) {
						onConstraintChange?.({
							eventId: newEventId(),
							id: item.id,
							keepProportion: menuStateMap.KeepAspectRatio !== "Active",
						});
					}
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
		const { selectedItems, changeItemsStyle } = refBus.current;

		changeItemsStyle(selectedItems, {
			stroke: borderColor,
		});
	}, []);

	diagramMenuProps.onBgColorChange = useCallback((bgColor: string) => {
		// Bypass references to avoid function creation in every render.
		const { selectedItems, changeItemsStyle } = refBus.current;

		changeItemsStyle(selectedItems, {
			fill: bgColor,
		});
	}, []);

	diagramMenuProps.onBorderRadiusChange = useCallback(
		(borderRadius: number) => {
			// Bypass references to avoid function creation in every render.
			const { selectedItems, changeItemsStyle } = refBus.current;

			changeItemsStyle(selectedItems, {
				cornerRadius: borderRadius,
			});
		},
		[],
	);

	diagramMenuProps.onFontSizeChange = useCallback((fontSize: number) => {
		// Bypass references to avoid function creation in every render.
		const { selectedItems, changeItemsStyle } = refBus.current;

		changeItemsStyle(selectedItems, {
			fontSize,
		});
	}, []);

	diagramMenuProps.onFontColorChange = useCallback((fontColor: string) => {
		// Bypass references to avoid function creation in every render.
		const { selectedItems, changeItemsStyle } = refBus.current;

		changeItemsStyle(selectedItems, {
			fontColor,
		});
	}, []);

	return {
		diagramMenuProps,
	};
};
