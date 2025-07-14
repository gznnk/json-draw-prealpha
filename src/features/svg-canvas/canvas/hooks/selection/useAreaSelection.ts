// Import React.
import { useCallback, useRef, useState } from "react";

// Import types related to SvgCanvas.
import type { SvgCanvasSubHooksProps } from "../../types/SvgCanvasSubHooksProps";
import type { AreaSelectionEvent } from "../../../types/events/AreaSelectionEvent";
import type { AreaSelectionState } from "../../types/AreaSelectionState";

// Import functions related to SvgCanvas.
import { isSelectableData } from "../../../utils/validation/isSelectableData";
import { calcItemBoundingBox } from "../../../utils/math/geometry/calcItemBoundingBox";
import { newEventId } from "../../../utils/common/newEventId";

// Import selection hooks
import { useOnSelect } from "../handlers/useOnSelect";
import { useClearAllSelection } from "./useClearAllSelection";

/**
 * Custom hook to handle area selection on the canvas.
 */
export const useAreaSelection = (props: SvgCanvasSubHooksProps) => {
	const [selectionState, setSelectionState] = useState<AreaSelectionState>({
		isSelecting: false,
		startX: 0,
		startY: 0,
		endX: 0,
		endY: 0,
	});

	// Get the select function from useSelect hook with Ctrl key pressed (for multi-select)
	const onSelect = useOnSelect(props, true);

	// Get the clear all selection function
	const onClearAllSelection = useClearAllSelection(props);

	// Create references bypass to avoid function creation in every render.
	const refBusVal = {
		props,
		selectionState,
		onSelect,
	};
	const refBus = useRef(refBusVal);
	refBus.current = refBusVal;

	/**
	 * Convert client coordinates to SVG canvas coordinates using matrixTransform
	 */
	const clientToCanvasCoords = useCallback(
		(clientX: number, clientY: number) => {
			const { canvasRef } = refBus.current.props;

			if (!canvasRef?.svgRef.current) {
				return { x: 0, y: 0 };
			}

			const svgElement = canvasRef.svgRef.current;
			const svgPoint = svgElement.createSVGPoint();
			svgPoint.x = clientX;
			svgPoint.y = clientY;

			const screenCTM = svgElement.getScreenCTM();
			if (screenCTM) {
				// Inverse transform to convert from client coordinates to SVG coordinates
				const svgCoords = svgPoint.matrixTransform(screenCTM.inverse());
				return { x: svgCoords.x, y: svgCoords.y };
			}

			return { x: 0, y: 0 };
		},
		[],
	);

	/**
	 * Update items selection based on the current selection state
	 */
	const updateItemsSelection = useCallback(
		(selectionBounds: {
			startX: number;
			startY: number;
			endX: number;
			endY: number;
		}) => {
			const {
				props: { canvasState },
				onSelect,
			} = refBus.current;

			// Calculate selection bounds in canvas coordinates
			const minX = Math.min(selectionBounds.startX, selectionBounds.endX);
			const maxX = Math.max(selectionBounds.startX, selectionBounds.endX);
			const minY = Math.min(selectionBounds.startY, selectionBounds.endY);
			const maxY = Math.max(selectionBounds.startY, selectionBounds.endY);

			// Find items that are within the selection bounds
			const itemsToSelect: string[] = [];

			for (const item of canvasState.items) {
				if (!isSelectableData(item)) continue;

				// Calculate item bounding box using calcItemBoundingBox function
				const itemBounds = calcItemBoundingBox(item);

				// Check if item's bounding box is completely contained within selection rectangle
				const isSelected =
					itemBounds.left >= minX &&
					itemBounds.right <= maxX &&
					itemBounds.top >= minY &&
					itemBounds.bottom <= maxY;

				if (isSelected) {
					itemsToSelect.push(item.id);
				}
			}

			// Apply selection using the proper useSelect logic
			// For area selection, we want to select the first item (clearing previous selections)
			// then add additional items with multi-select behavior
			if (itemsToSelect.length > 0) {
				// Select first item (this clears existing selections)
				onSelect({
					eventId: newEventId(),
					id: itemsToSelect[0],
				});

				// Add remaining items with multi-select
				for (let i = 1; i < itemsToSelect.length; i++) {
					onSelect({
						eventId: newEventId(),
						id: itemsToSelect[i],
					});
				}
			}
		},
		[],
	);

	/**
	 * Update outline display for items within the selection bounds during area selection
	 */
	const updateOutlineDisplay = useCallback(
		(selectionBounds: {
			startX: number;
			startY: number;
			endX: number;
			endY: number;
		}) => {
			const {
				props: { setCanvasState },
			} = refBus.current;

			// Calculate selection bounds in canvas coordinates
			const minX = Math.min(selectionBounds.startX, selectionBounds.endX);
			const maxX = Math.max(selectionBounds.startX, selectionBounds.endX);
			const minY = Math.min(selectionBounds.startY, selectionBounds.endY);
			const maxY = Math.max(selectionBounds.startY, selectionBounds.endY);

			setCanvasState((prevState) => ({
				...prevState,
				items: prevState.items.map((item) => {
					if (!isSelectableData(item)) return item;

					// Calculate item bounding box using calcItemBoundingBox function
					const itemBounds = calcItemBoundingBox(item);

					// Check if item's bounding box is completely contained within selection rectangle
					const isInSelection =
						itemBounds.left >= minX &&
						itemBounds.right <= maxX &&
						itemBounds.top >= minY &&
						itemBounds.bottom <= maxY;

					return {
						...item,
						showOutline: isInSelection,
					};
				}),
			}));
		},
		[],
	);

	/**
	 * Clear outline display for all items
	 */
	const clearOutlineDisplay = useCallback(() => {
		const {
			props: { setCanvasState },
		} = refBus.current;

		setCanvasState((prevState) => ({
			...prevState,
			items: prevState.items.map((item) => {
				if (!isSelectableData(item)) return item;
				return {
					...item,
					showOutline: false,
				};
			}),
		}));
	}, []);

	/**
	 * Handle area selection events
	 */
	const onAreaSelection = useCallback(
		(event: AreaSelectionEvent) => {
			const { eventType, clientX, clientY } = event;

			switch (eventType) {
				case "Start": {
					const { x, y } = clientToCanvasCoords(clientX, clientY);

					// Clear existing selections when starting area selection
					onClearAllSelection();

					setSelectionState({
						isSelecting: true,
						startX: x,
						startY: y,
						endX: x,
						endY: y,
					});
					break;
				}

				case "InProgress": {
					const { selectionState } = refBus.current;
					const { x, y } = clientToCanvasCoords(clientX, clientY);

					const newSelectionState = {
						isSelecting: true,
						startX: selectionState.startX,
						startY: selectionState.startY,
						endX: x,
						endY: y,
					};

					setSelectionState(newSelectionState);

					// Update outline display for items within selection bounds
					updateOutlineDisplay(newSelectionState);
					break;
				}

				case "End": {
					const { selectionState } = refBus.current;

					if (!selectionState.isSelecting) return;

					// Update items selection with current selection bounds
					updateItemsSelection(selectionState);

					// Reset selection state
					setSelectionState({
						isSelecting: false,
						startX: 0,
						startY: 0,
						endX: 0,
						endY: 0,
					});
					break;
				}
			}
		},
		[
			clientToCanvasCoords,
			onClearAllSelection,
			updateItemsSelection,
			updateOutlineDisplay,
		],
	);

	const onCancelAreaSelection = useCallback(() => {
		// Clear outline display for all items
		clearOutlineDisplay();

		setSelectionState({
			isSelecting: false,
			startX: 0,
			startY: 0,
			endX: 0,
			endY: 0,
		});
	}, [clearOutlineDisplay]);
	return {
		selectionState,
		onAreaSelection,
		onCancelAreaSelection,
	};
};
