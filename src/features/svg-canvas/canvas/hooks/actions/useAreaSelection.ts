// Import React.
import { useCallback, useRef, useState } from "react";

// Import types related to SvgCanvas.
import type { CanvasHooksProps } from "../../SvgCanvasTypes";

// Import functions related to SvgCanvas.
import { isSelectableData } from "../../../utils/validation/isSelectableData";
import { calcItemBoundingBox } from "../../../utils/math/geometry/calcItemBoundingBox";

/**
 * Area selection state type
 */
export type AreaSelectionState = {
	isSelecting: boolean;
	startX: number;
	startY: number;
	endX: number;
	endY: number;
};

/**
 * Custom hook to handle area selection on the canvas.
 */
export const useAreaSelection = (props: CanvasHooksProps) => {
	const [selectionState, setSelectionState] = useState<AreaSelectionState>({
		isSelecting: false,
		startX: 0,
		startY: 0,
		endX: 0,
		endY: 0,
	});

	// Create references bypass to avoid function creation in every render.
	const refBusVal = {
		props,
		selectionState,
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
			const { setCanvasState } = refBus.current.props;

			setCanvasState((prevCanvasState) => {
				// Calculate selection bounds in canvas coordinates
				const minX = Math.min(selectionBounds.startX, selectionBounds.endX);
				const maxX = Math.max(selectionBounds.startX, selectionBounds.endX);
				const minY = Math.min(selectionBounds.startY, selectionBounds.endY);
				const maxY = Math.max(selectionBounds.startY, selectionBounds.endY);

				// Update selection state of items
				const updatedItems = prevCanvasState.items.map((item) => {
					if (!isSelectableData(item)) return item;

					// Calculate item bounding box using calcItemBoundingBox function
					const itemBounds = calcItemBoundingBox(item);

					// Check if item's bounding box is completely contained within selection rectangle
					const isSelected =
						itemBounds.left >= minX &&
						itemBounds.right <= maxX &&
						itemBounds.top >= minY &&
						itemBounds.bottom <= maxY;

					return {
						...item,
						isSelected,
					};
				});

				return {
					...prevCanvasState,
					items: updatedItems,
				};
			});
		},
		[],
	);

	const onStartAreaSelection = useCallback(
		(clientX: number, clientY: number) => {
			const { x, y } = clientToCanvasCoords(clientX, clientY);
			setSelectionState({
				isSelecting: true,
				startX: x,
				startY: y,
				endX: x,
				endY: y,
			});
		},
		[clientToCanvasCoords],
	);

	const onUpdateAreaSelection = useCallback(
		(clientX: number, clientY: number) => {
			const { x, y } = clientToCanvasCoords(clientX, clientY);

			setSelectionState((prev) => {
				const newState = {
					...prev,
					endX: x,
					endY: y,
				};

				// Perform real-time selection update
				updateItemsSelection(newState);

				return newState;
			});
		},
		[clientToCanvasCoords, updateItemsSelection],
	);

	const onEndAreaSelection = useCallback(() => {
		const { selectionState: currentSelectionState } = refBus.current;

		if (!currentSelectionState.isSelecting) return;

		// Update items selection with current selection bounds
		updateItemsSelection(currentSelectionState);

		// Reset selection state
		setSelectionState({
			isSelecting: false,
			startX: 0,
			startY: 0,
			endX: 0,
			endY: 0,
		});
	}, [updateItemsSelection]);

	const onCancelAreaSelection = useCallback(() => {
		setSelectionState({
			isSelecting: false,
			startX: 0,
			startY: 0,
			endX: 0,
			endY: 0,
		});
	}, []);

	return {
		selectionState,
		onStartAreaSelection,
		onUpdateAreaSelection,
		onEndAreaSelection,
		onCancelAreaSelection,
	};
};
