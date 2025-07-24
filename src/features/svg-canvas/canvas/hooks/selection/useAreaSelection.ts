// Import React.
import { useCallback, useEffect, useRef } from "react";

// Import types.
import type { Diagram } from "../../../types/data/catalog/Diagram";
import type { AreaSelectionEvent } from "../../../types/events/AreaSelectionEvent";
import type { SvgCanvasScrollEvent } from "../../../types/events/SvgCanvasScrollEvent";
import { InteractionState } from "../../types/InteractionState";
import type { SvgCanvasSubHooksProps } from "../../types/SvgCanvasSubHooksProps";

// Import constants.
import { EVENT_NAME_SVG_CANVAS_SCROLL } from "../../../constants/EventNames";

// Import utils.
import { newEventId } from "../../../utils/common/newEventId";
import { calcItemBoundingBox } from "../../../utils/math/geometry/calcItemBoundingBox";
import { isItemableData } from "../../../utils/validation/isItemableData";
import { isSelectableData } from "../../../utils/validation/isSelectableData";
import { applyFunctionRecursively } from "../../utils/applyFunctionRecursively";

// Import hooks.
import { useOnSelect } from "../diagram/useOnSelect";
import { useAutoEdgeScroll } from "../navigation/useAutoEdgeScroll";
import { useClearAllSelection } from "./useClearAllSelection";

/**
 * Update items array with outline display based on selection bounds
 */
const updateItemsWithOutline = (
	items: Diagram[],
	selectionBounds: {
		startX: number;
		startY: number;
		endX: number;
		endY: number;
	},
) => {
	// Calculate selection bounds in canvas coordinates
	const minX = Math.min(selectionBounds.startX, selectionBounds.endX);
	const maxX = Math.max(selectionBounds.startX, selectionBounds.endX);
	const minY = Math.min(selectionBounds.startY, selectionBounds.endY);
	const maxY = Math.max(selectionBounds.startY, selectionBounds.endY);

	return applyFunctionRecursively(items, (item) => {
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
	});
};

/**
 * Convert client coordinates to SVG canvas coordinates using matrixTransform
 */
const clientToCanvasCoords = (
	clientX: number,
	clientY: number,
	svgElement: SVGSVGElement | null,
) => {
	if (!svgElement) {
		return { x: 0, y: 0 };
	}

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
};

/**
 * Custom hook to handle area selection on the canvas.
 */
export const useAreaSelection = (props: SvgCanvasSubHooksProps) => {
	// Get the select function from useSelect hook with Ctrl key pressed (for multi-select)
	const onSelect = useOnSelect(props, true);

	// Get the clear all selection function
	const onClearAllSelection = useClearAllSelection(props);

	// Get the auto edge scroll function, clear function, and scrolling state
	const { autoEdgeScroll, clearAutoEdgeScroll, isAutoScrolling } =
		useAutoEdgeScroll(props);

	// Create references bypass to avoid function creation in every render.
	const refBusVal = {
		props,
		onSelect,
		autoEdgeScroll,
	};
	const refBus = useRef(refBusVal);
	refBus.current = refBusVal;

	// Handle scroll events from auto edge scroll
	useEffect(() => {
		const { eventBus } = refBus.current.props;

		const handleScrollEvent = (event: CustomEvent<SvgCanvasScrollEvent>) => {
			// Bypass references to avoid function creation in every render.
			const { setCanvasState, canvasState } = refBus.current.props;
			const { interactionState } = canvasState;

			// If area selection is not active, do nothing
			if (interactionState !== InteractionState.AreaSelection) {
				return;
			}

			const { newMinX, newMinY, clientX, clientY, deltaX, deltaY } =
				event.detail;
			const { canvasRef } = refBus.current.props;
			const { x, y } = clientToCanvasCoords(
				clientX + deltaX,
				clientY + deltaY,
				canvasRef?.svgRef.current || null,
			);

			const newSelectionBounds = {
				startX: canvasState.areaSelectionState.startX,
				startY: canvasState.areaSelectionState.startY,
				endX: x,
				endY: y,
			};

			// Update both the area selection state and items outline in a single setCanvasState call
			setCanvasState((prevState) => ({
				...prevState,
				minX: newMinX,
				minY: newMinY,
				areaSelectionState: {
					...prevState.areaSelectionState,
					endX: x,
					endY: y,
				},
				items: updateItemsWithOutline(prevState.items, newSelectionBounds),
			}));
		};

		eventBus.addEventListener(EVENT_NAME_SVG_CANVAS_SCROLL, handleScrollEvent);

		return () => {
			eventBus.removeEventListener(
				EVENT_NAME_SVG_CANVAS_SCROLL,
				handleScrollEvent,
			);
		};
	}, []);

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

			// Find items that are within the selection bounds recursively
			const itemsToSelect: string[] = [];

			const collectSelectableItems = (items: Diagram[]) => {
				for (const item of items) {
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

					// Recursively check child items
					if (isItemableData(item) && item.items) {
						collectSelectableItems(item.items);
					}
				}
			};

			collectSelectableItems(canvasState.items);

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
	 * Clear outline display for all items
	 */
	const clearOutlineDisplay = useCallback(() => {
		const {
			props: { setCanvasState },
		} = refBus.current;

		setCanvasState((prevState) => ({
			...prevState,
			items: applyFunctionRecursively(prevState.items, (item) => {
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
			const { canvasState, setCanvasState } = refBus.current.props;
			const { eventType, clientX, clientY } = event;

			// If isAutoScrolling, skip movement logic and only call autoEdgeScroll
			if (isAutoScrolling) {
				const { canvasRef } = refBus.current.props;
				const { x, y } = clientToCanvasCoords(
					clientX,
					clientY,
					canvasRef?.svgRef.current || null,
				);
				refBus.current.autoEdgeScroll({
					cursorX: x,
					cursorY: y,
					clientX,
					clientY,
				});
				return;
			}

			switch (eventType) {
				case "Start": {
					const { canvasRef } = refBus.current.props;
					const { x, y } = clientToCanvasCoords(
						clientX,
						clientY,
						canvasRef?.svgRef.current || null,
					);

					// Clear existing selections when starting area selection
					onClearAllSelection();

					// Set interaction state to AreaSelection and initialize selection state
					setCanvasState((prevState) => ({
						...prevState,
						interactionState: InteractionState.AreaSelection,
						areaSelectionState: {
							startX: x,
							startY: y,
							endX: x,
							endY: y,
						},
					}));
					break;
				}

				case "InProgress": {
					// If area selection is not active, do nothing
					if (canvasState.interactionState !== InteractionState.AreaSelection) {
						return;
					}

					const { canvasRef } = refBus.current.props;
					const { x, y } = clientToCanvasCoords(
						clientX,
						clientY,
						canvasRef?.svgRef.current || null,
					);
					const { areaSelectionState } = canvasState;

					const newSelectionState = {
						startX: areaSelectionState.startX,
						startY: areaSelectionState.startY,
						endX: x,
						endY: y,
					};

					// Update both the area selection state and items outline in a single setCanvasState call
					setCanvasState((prevState) => ({
						...prevState,
						items: updateItemsWithOutline(prevState.items, newSelectionState),
						areaSelectionState: newSelectionState,
					}));

					// Trigger auto edge scroll based on current cursor position
					refBus.current.autoEdgeScroll({
						cursorX: x,
						cursorY: y,
						clientX,
						clientY,
					});
					break;
				}

				case "End": {
					// If area selection is not active, do nothing
					if (canvasState.interactionState !== InteractionState.AreaSelection) {
						return;
					}

					// Update items selection with current selection bounds
					const { areaSelectionState } = canvasState;
					updateItemsSelection(areaSelectionState);

					// Clear auto edge scroll when area selection ends
					clearAutoEdgeScroll();

					// Update interaction state to Idle and reset selection state
					setCanvasState((prevState) => ({
						...prevState,
						interactionState: InteractionState.Idle,
						areaSelectionState: {
							startX: 0,
							startY: 0,
							endX: 0,
							endY: 0,
						},
					}));
					break;
				}
			}
		},
		[
			onClearAllSelection,
			updateItemsSelection,
			clearAutoEdgeScroll,
			isAutoScrolling,
		],
	);

	const onCancelAreaSelection = useCallback(() => {
		// Clear outline display for all items
		clearOutlineDisplay();

		// Clear auto edge scroll when area selection is cancelled
		clearAutoEdgeScroll();

		// Reset interaction state to Idle and selection state
		const { setCanvasState } = refBus.current.props;
		setCanvasState((prevState) => ({
			...prevState,
			interactionState: InteractionState.Idle,
			areaSelectionState: {
				startX: 0,
				startY: 0,
				endX: 0,
				endY: 0,
			},
		}));
	}, [clearOutlineDisplay, clearAutoEdgeScroll]);

	return {
		selectionState: props.canvasState.areaSelectionState,
		onAreaSelection,
		onCancelAreaSelection,
	};
};
