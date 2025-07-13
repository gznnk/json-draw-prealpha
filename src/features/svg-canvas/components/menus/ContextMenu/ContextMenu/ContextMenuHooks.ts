// Import React.
import { useCallback, useState } from "react";

// Import types related to SvgCanvas.
import type { SvgCanvasProps } from "../../../../canvas/types/SvgCanvasProps";

// Import functions related to SvgCanvas.
import { getSelectedItems } from "../../../../utils/common/getSelectedItems";
import { isExportable } from "../../../../utils/validation/isExportable";

// Imports related to this component.
import type { ContextMenuStateMap, ContextMenuType } from "./ContextMenuTypes";

export const useContextMenu = (canvasProps: SvgCanvasProps) => {
	// Extract properties from canvasProps.
	const {
		items,
		multiSelectGroup,
		history,
		historyIndex,
		grabScrollState,
		onUndo,
		onRedo,
		onSelectAll,
		onGroup,
		onUngroup,
		onExport,
		onDelete,
		onCopy,
		onPaste,
	} = canvasProps;

	// State to manage the context menu position and visibility
	const [contextMenuState, setContextMenuState] = useState({
		x: 0,
		y: 0,
		isVisible: false,
	});

	// Create a map of context menu states.
	const selectedItems = getSelectedItems(items);
	const isItemSelected = selectedItems.length > 0;
	const isGroupSelected = selectedItems.some((item) => item.type === "Group");
	const isExportableSelected = selectedItems.some((item) => isExportable(item));
	const menuStateMap = {
		Undo: historyIndex > 0 ? "Enable" : "Disable",
		Redo: historyIndex < history.length - 1 ? "Enable" : "Disable",
		Copy: isItemSelected ? "Enable" : "Disable",
		Paste: "Enable", // Paste function is always enabled
		SelectAll: items.length > 0 ? "Enable" : "Disable",
		Group: multiSelectGroup ? "Enable" : "Disable",
		Ungroup: isGroupSelected ? "Enable" : "Disable",
		Export: isExportableSelected ? "Enable" : "Disable",
		Delete: isItemSelected ? "Enable" : "Disable",
	} as ContextMenuStateMap;

	/**
	 * Handle menu item clicks.
	 */
	const onMenuClick = useCallback(
		(menuType: ContextMenuType) => {
			switch (menuType) {
				case "Undo":
					onUndo?.();
					break;
				case "Redo":
					onRedo?.();
					break;
				case "Copy":
					onCopy?.();
					break;
				case "Paste":
					onPaste?.();
					break;
				case "SelectAll":
					onSelectAll?.();
					break;
				case "Group":
					onGroup?.();
					break;
				case "Ungroup":
					onUngroup?.();
					break;
				case "Export":
					onExport?.();
					break;
				case "Delete":
					onDelete?.();
					break;
				default:
			}
			setContextMenuState({ x: 0, y: 0, isVisible: false });
		},
		[
			onUndo,
			onRedo,
			onCopy,
			onPaste,
			onSelectAll,
			onGroup,
			onUngroup,
			onExport,
			onDelete,
		],
	);

	/**
	 * Handle right-click events to show the context menu.
	 */
	const onContextMenu = useCallback(
		(e: React.MouseEvent<SVGSVGElement>) => {
			e.preventDefault();

			console.log(grabScrollState);

			// If grab scrolling is active, do not show the context menu.
			if (grabScrollState?.grabScrollOccurred === true) return;

			const x = e.clientX;
			const y = e.clientY;
			setContextMenuState({ x, y, isVisible: true });
		},
		[grabScrollState],
	);

	/**
	 * Close the context menu.
	 */
	const closeContextMenu = useCallback(() => {
		setContextMenuState((prevState) => ({
			...prevState,
			isVisible: false,
		}));
	}, []);

	return {
		contextMenuProps: {
			...contextMenuState,
			menuStateMap,
			onMenuClick,
		},
		contextMenuHandlers: {
			onContextMenu,
		},
		contextMenuFunctions: {
			closeContextMenu,
		},
	};
};
