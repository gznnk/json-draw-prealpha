// Import React.
import { useCallback, useRef } from "react";

// Import types related to SvgCanvas.
import type { ConnectLineData } from "../../components/shapes/ConnectLine";
import type { GroupData } from "../../components/shapes/Group";
import type { Diagram } from "../../types/DiagramCatalog";
import type { CanvasHooksProps } from "../SvgCanvasTypes";

// Import functions related to SvgCanvas.
import { calcGroupBoxOfNoRotation } from "../../components/shapes/Group";
import { newId } from "../../utils/Diagram";
import {
	isConnectableData,
	isItemableData,
	isSelectableData,
} from "../../utils/TypeUtils";
import { MULTI_SELECT_GROUP } from "../SvgCanvasConstants";

/**
 * Offset amount when pasting shapes
 */
const PASTE_OFFSET = 20;

/**
 * Type definition for mapping between old IDs and new IDs
 */
type IdMap = { [oldId: string]: string };

/**
 * Recursively processes an item to reassign IDs and apply position offsets
 *
 * @param item - The diagram item to process
 * @param idMap - Mapping of old IDs to new IDs
 * @returns Processed diagram item with new IDs and offset positions
 */
const processItemRecursively = (item: Diagram, idMap: IdMap): Diagram => {
	// Generate new ID
	const newItemId = newId();
	idMap[item.id] = newItemId;

	// Copy basic item information
	const newItem = {
		...item,
		id: newItemId,
	};

	// Apply offset to positioned elements
	if ("x" in newItem && "y" in newItem) {
		newItem.x = (newItem.x as number) + PASTE_OFFSET;
		newItem.y = (newItem.y as number) + PASTE_OFFSET;
	}

	// Process connection points if present
	if (isConnectableData(newItem) && newItem.connectPoints) {
		newItem.connectPoints = newItem.connectPoints.map((point) => {
			const newPointId = newId();
			idMap[point.id] = newPointId;

			return {
				...point,
				id: newPointId,
				x: point.x + PASTE_OFFSET,
				y: point.y + PASTE_OFFSET,
			};
		});
	}

	// Process child items recursively
	if (isItemableData(newItem) && newItem.items) {
		newItem.items = newItem.items.map((childItem) =>
			processItemRecursively(childItem, idMap),
		);
	}

	return newItem;
};

/**
 * Updates connection lines with new IDs and positions
 *
 * @param line - Connection line to process
 * @param idMap - Mapping of old IDs to new IDs
 * @returns Updated connection line or null if invalid
 */
const processConnectLine = (
	line: ConnectLineData,
	idMap: IdMap,
): ConnectLineData | null => {
	// Verify both endpoints are included
	if (!idMap[line.startOwnerId] || !idMap[line.endOwnerId]) {
		return null;
	}

	// Update connection line
	return {
		...line,
		id: newId(),
		x: line.x + PASTE_OFFSET,
		y: line.y + PASTE_OFFSET,
		startOwnerId: idMap[line.startOwnerId],
		endOwnerId: idMap[line.endOwnerId],
		items: line.items.map((point, index) => {
			let pointId: string;
			if (index === 0 || index === line.items.length - 1) {
				pointId = idMap[point.id] || newId();
			} else {
				pointId = newId();
			}

			return {
				...point,
				id: pointId,
				x: point.x + PASTE_OFFSET,
				y: point.y + PASTE_OFFSET,
			};
		}),
	};
};

/**
 * Custom hook to handle paste events on the canvas.
 * Processes clipboard data to create new shapes with new IDs and offset positions.
 *
 * @param props - Canvas hook properties
 * @returns Callback function for paste operation
 */
export const usePaste = (props: CanvasHooksProps) => {
	// Create references bypass to avoid function creation in every render
	const refBusVal = {
		props,
	};
	const refBus = useRef(refBusVal);
	refBus.current = refBusVal;

	return useCallback(() => {
		// Bypass references to avoid function creation in every render
		const { setCanvasState } = refBus.current.props;

		// Read data from clipboard
		navigator.clipboard
			.readText()
			.then((clipboardText) => {
				try {
					// Parse clipboard data
					const clipboardData = JSON.parse(clipboardText) as Diagram[];

					if (!Array.isArray(clipboardData) || clipboardData.length === 0) {
						console.error("Invalid clipboard data format");
						return;
					}

					// Store ID mappings
					const idMap: IdMap = {};

					// Separate connection lines from other shapes
					const connectLines = clipboardData.filter(
						(item) => item.type === "ConnectLine",
					) as ConnectLineData[];
					const normalItems = clipboardData.filter(
						(item) => item.type !== "ConnectLine",
					);

					// Determine if multi-select mode
					const isMultiSelect = normalItems.length > 1;

					// Process regular shapes (reassign IDs and apply offset)
					const processedNormalItems = normalItems.map((item) =>
						processItemRecursively(item, idMap),
					);

					// Update canvas state
					setCanvasState((prevState) => {
						// Deselect all existing items
						const deselectedItems = prevState.items.map((item) => {
							if (isSelectableData(item)) {
								return {
									...item,
									isSelected: false,
									isMultiSelectSource: false,
								};
							}
							return item;
						});

						// Add processed regular items to canvas
						let allItems = [...deselectedItems, ...processedNormalItems];

						// Process and add connection lines
						if (connectLines.length > 0) {
							const processedConnectLines = connectLines
								.map((line) => processConnectLine(line, idMap))
								.filter((line): line is ConnectLineData => line !== null);

							allItems = [...allItems, ...processedConnectLines];
						}

						// Setup multi-select group if needed
						let multiSelectGroup = undefined;
						if (isMultiSelect) {
							// Calculate group position and size
							const box = calcGroupBoxOfNoRotation(processedNormalItems);

							multiSelectGroup = {
								id: MULTI_SELECT_GROUP,
								type: "Group",
								x: box.left + (box.right - box.left) / 2,
								y: box.top + (box.bottom - box.top) / 2,
								width: box.right - box.left,
								height: box.bottom - box.top,
								rotation: 0,
								scaleX: 1,
								scaleY: 1,
								keepProportion:
									prevState.multiSelectGroup?.keepProportion ?? true,
								isSelected: true,
								isMultiSelectSource: false,
								items: processedNormalItems,
							} as GroupData;
						}

						return {
							...prevState,
							items: allItems,
							isDiagramChanging: false,
							multiSelectGroup,
						};
					});
				} catch (error) {
					console.error("Error while pasting items from clipboard:", error);
				}
			})
			.catch((err) => {
				console.error("Failed to read clipboard contents:", err);
			});
	}, []);
};
