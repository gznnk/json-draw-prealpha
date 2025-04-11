// Import React.
import { useCallback, useRef } from "react";

// TODO: 場所
import { getSelectedItems } from "../../../diagrams/SvgCanvas/SvgCanvasFunctions";

// Import types related to SvgCanvas.
import type { SvgCanvasProps } from "../../../diagrams/SvgCanvas/SvgCanvasTypes";

// Import functions related to SvgCanvas.
import {
	isItemableData,
	isTextableData,
	isTransformativeData,
} from "../../../../utils/Diagram";
import { newEventId } from "../../../../utils/Util";

// Imports related to this component.
import type { DiagramMenuProps, DiagramMenuStateMap } from "./DiagramMenuTypes";

export const useDiagramMenu = (canvasProps: SvgCanvasProps) => {
	// Extract properties from canvasProps.
	const { items, isDiagramChanging, multiSelectGroup } = canvasProps;

	// Default menu props (invisible).
	let diagramMenuProps = {
		x: 0,
		y: 0,
		width: 0,
		height: 0,
		rotation: 0,
		scaleX: 1,
		scaleY: 1,
		isVisible: false,
		onMenuClick: (_menuType: string) => {},
	} as DiagramMenuProps;

	// Default menu state map.
	const menuStateMap = {
		BgColor: "Show",
		BorderColor: "Show",
		FontSize: "Hidden",
		Bold: "Hidden",
		FontColor: "Hidden",
		AlignLeft: "Hidden",
		AlignCenter: "Hidden",
		AlignRight: "Hidden",
		AlignTop: "Hidden",
		AlignMiddle: "Hidden",
		AlignBottom: "Hidden",
		Group: "Hidden",
	} as DiagramMenuStateMap;

	// Get selected items and check if the diagram menu should be shown.
	const selectedItems = getSelectedItems(items);
	const showDiagramMenu = 0 < selectedItems.length && !isDiagramChanging;

	// If the diagram menu should be shown, set the properties for the menu.
	if (showDiagramMenu) {
		const diagram = selectedItems[0];

		if (isTextableData(diagram) || isItemableData(diagram)) {
			menuStateMap.FontSize = "Show";
			menuStateMap.Bold = "Show";
			menuStateMap.FontColor = "Show";
			menuStateMap.AlignLeft = "Show";
			menuStateMap.AlignCenter = "Show";
			menuStateMap.AlignRight = "Show";
			menuStateMap.AlignTop = "Show";
			menuStateMap.AlignMiddle = "Show";
			menuStateMap.AlignBottom = "Show";

			if (isTextableData(diagram)) {
				if (diagram.textAlign === "left") {
					menuStateMap.AlignLeft = "Active";
				}
				if (diagram.textAlign === "center") {
					menuStateMap.AlignCenter = "Active";
				}
				if (diagram.textAlign === "right") {
					menuStateMap.AlignRight = "Active";
				}
				if (diagram.verticalAlign === "top") {
					menuStateMap.AlignTop = "Active";
				}
				if (diagram.verticalAlign === "center") {
					menuStateMap.AlignMiddle = "Active";
				}
				if (diagram.verticalAlign === "bottom") {
					menuStateMap.AlignBottom = "Active";
				}
			}
		}

		if (multiSelectGroup) {
			menuStateMap.Group = "Show";
		} else if (diagram.type === "Group") {
			menuStateMap.Group = "Active";
		}

		if (multiSelectGroup) {
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
				onMenuClick: (_menuType: string) => {}, // Temporarily empty.
			};
		} else {
			if (isTransformativeData(diagram)) {
				diagramMenuProps = {
					x: diagram.x,
					y: diagram.y,
					width: diagram.width,
					height: diagram.height,
					rotation: diagram.rotation,
					scaleX: diagram.scaleX,
					scaleY: diagram.scaleY,
					isVisible: true,
					menuStateMap,
					onMenuClick: (_menuType: string) => {}, // Temporarily empty.
				};
			}
		}
	}

	// Create references bypass to avoid function creation in every render.
	const refBusVal = {
		// Component properties
		canvasProps,
		// Internal variables and functions
		selectedItems,
		menuStateMap,
	};
	const refBus = useRef(refBusVal);
	refBus.current = refBusVal;

	diagramMenuProps.onMenuClick = useCallback((menuType: string) => {
		// Bypass references to avoid function creation in every render.
		const {
			canvasProps: { onDiagramChange, onGroup, onUngroup },
			selectedItems,
			menuStateMap,
		} = refBus.current;

		switch (menuType) {
			case "BgColor":
				// Handle background color change.
				break;
			case "BorderColor":
				// Handle border color change.
				break;
			case "FontSize":
				// Handle font size change.
				break;
			case "Bold":
				// Handle bold text change.
				break;
			case "FontColor":
				// Handle font color change.
				break;
			case "AlignLeft":
				// TODO: Generalize this code to avoid duplication.
				for (const item of selectedItems) {
					if (isTextableData(item)) {
						onDiagramChange?.({
							eventId: newEventId(),
							eventType: "Immediate",
							id: item.id,
							startDiagram: item,
							endDiagram: {
								...item,
								textAlign: "left",
							},
						});
					}
				}
				break;
			case "AlignCenter":
				// TODO: Generalize this code to avoid duplication.
				for (const item of selectedItems) {
					if (isTextableData(item)) {
						onDiagramChange?.({
							eventId: newEventId(),
							eventType: "Immediate",
							id: item.id,
							startDiagram: item,
							endDiagram: {
								...item,
								textAlign: "center",
							},
						});
					}
				}
				break;
			case "AlignRight":
				// TODO: Generalize this code to avoid duplication.
				for (const item of selectedItems) {
					if (isTextableData(item)) {
						onDiagramChange?.({
							eventId: newEventId(),
							eventType: "Immediate",
							id: item.id,
							startDiagram: item,
							endDiagram: {
								...item,
								textAlign: "right",
							},
						});
					}
				}
				break;
			case "AlignTop":
				// Handle top alignment change.
				break;
			case "AlignMiddle":
				// Handle middle alignment change.
				break;
			case "AlignBottom":
				// Handle bottom alignment change.
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

	return {
		diagramMenuProps,
	};
};
