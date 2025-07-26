// Import React.
import { useCallback, useRef } from "react";

// Import types.
import type { Diagram } from "../../../types/data/catalog/Diagram";
import type { GroupData } from "../../../types/data/shapes/GroupData";
import type { AreaSelectionEvent } from "../../../types/events/AreaSelectionEvent";
import { InteractionState } from "../../types/InteractionState";
import type { SvgCanvasSubHooksProps } from "../../types/SvgCanvasSubHooksProps";

// Import constants.
import {
	AUTO_SCROLL_STEP_SIZE,
	AUTO_SCROLL_INTERVAL_MS,
} from "../../SvgCanvasConstants";

// Import utils.
import { calcItemBoundingBox } from "../../../utils/math/geometry/calcItemBoundingBox";
import { getSelectedItems } from "../../../utils/common/getSelectedItems";
import { isItemableData } from "../../../utils/validation/isItemableData";
import { isSelectableData } from "../../../utils/validation/isSelectableData";
import { applyFunctionRecursively } from "../../utils/applyFunctionRecursively";
import { createMultiSelectGroup } from "../../utils/createMultiSelectGroup";
import { removeNonTransformativeShowTransformControls } from "../../utils/removeNonTransformativeShowTransformControls";
import { updateOutlineBySelection } from "../../utils/updateOutlineBySelection";
import { detectEdgeProximity } from "../../utils/detectEdgeProximity";

// Import hooks.
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
		if (item.type === "ConnectLine") return item;

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
	// Get the clear all selection function
	const onClearAllSelection = useClearAllSelection(props);

	// Internal state for edge scrolling
	const scrollIntervalRef = useRef<number | null>(null);
	const isScrollingRef = useRef(false);
	const currentCursorPosRef = useRef<{
		x: number;
		y: number;
	} | null>(null);
	// Reference to store the last scroll direction for continuous scrolling
	const lastScrollDirectionRef = useRef<{
		horizontal: "left" | "right" | null;
		vertical: "top" | "bottom" | null;
	}>({ horizontal: null, vertical: null });

	// Create references bypass to avoid function creation in every render.
	const refBusVal = {
		props,
	};
	const refBus = useRef(refBusVal);
	refBus.current = refBusVal;

	/**
	 * Updates the selection state of items after area selection.
	 * This function applies selection logic, group selection, and transform controls according to the current outline state.
	 *
	 * - Sets isSelected for items with showOutline
	 * - Handles group selection and deselects children when a group is selected
	 * - Creates a multiSelectGroup if multiple items are selected
	 * - Shows transform controls for single selection
	 * - Updates outline display for selected items and their ancestors
	 * - Removes transform controls from non-transformative items
	 */
	const updateItemsSelection = useCallback(() => {
		const {
			props: { setCanvasState },
		} = refBus.current;

		setCanvasState((prevState) => {
			/**
			 * Step 1: Set isSelected for items with showOutline
			 * Only items with showOutline are marked as selected
			 */
			let items = applyFunctionRecursively(prevState.items, (item) => {
				if (!isSelectableData(item)) {
					return item;
				}
				// Mark item as selected if showOutline is true
				if (item.showOutline) {
					return {
						...item,
						isSelected: true,
					};
				}
				return item;
			});

			/**
			 * Step 2: Handle group selection logic
			 * If all children of a group are selected, select the group and deselect its children
			 */
			const processGroupSelectionLogic = (items: Diagram[]): Diagram[] => {
				const processItem = (item: Diagram): Diagram => {
					// Recursively process nested items (bottom-up)
					if (isItemableData(item)) {
						const updatedItems = item.items.map(processItem);
						// Select group if all children are selected
						if (
							updatedItems.length > 0 &&
							updatedItems.every(
								(child) => isSelectableData(child) && child.isSelected,
							)
						) {
							// Deselect children when group is selected
							const deselectedItems = updatedItems.map((child) => {
								if (isSelectableData(child)) {
									return {
										...child,
										isSelected: false,
									};
								}
								return child;
							});
							return {
								...item,
								items: deselectedItems,
								isSelected: true,
								showOutline: true,
							};
						}
						// Return group with updated children
						return {
							...item,
							items: updatedItems,
						};
					}
					return item;
				};
				return items.map(processItem);
			};
			items = processGroupSelectionLogic(items);

			/**
			 * Step 3: Multi-selection logic
			 * If multiple items are selected, create a multiSelectGroup
			 * If only one item is selected, show transform controls for it
			 */
			const selectedItems = getSelectedItems(items);
			let multiSelectGroup: GroupData | undefined = undefined;
			if (selectedItems.length > 1) {
				// Create multiSelectGroup for multiple selection
				multiSelectGroup = createMultiSelectGroup(
					selectedItems,
					prevState.multiSelectGroup?.keepProportion,
				);
			} else {
				// Show transform controls for single selected item
				items = applyFunctionRecursively(items, (item) => {
					if (!isSelectableData(item)) {
						return item;
					}
					if (item.isSelected) {
						return {
							...item,
							showTransformControls: true,
						};
					}
					return item;
				});
			}

			/**
			 * Step 4: Update outline display for selected items and their ancestors (shared utility)
			 */
			items = updateOutlineBySelection(items);

			/**
			 * Step 5: Remove transform controls from non-transformative items (shared utility)
			 */
			items = removeNonTransformativeShowTransformControls(items);

			return {
				...prevState,
				items,
				multiSelectGroup,
			};
		});
	}, []);


	/**
	 * Clear edge scrolling interval and reset state
	 */
	const clearEdgeScroll = useCallback(() => {
		if (scrollIntervalRef.current !== null) {
			clearInterval(scrollIntervalRef.current);
			scrollIntervalRef.current = null;
		}
		isScrollingRef.current = false;
		lastScrollDirectionRef.current = {
			horizontal: null,
			vertical: null,
		};
		currentCursorPosRef.current = null;
	}, []);

	/**
	 * Start edge scrolling based on proximity to canvas edges
	 */
	const startEdgeScroll = useCallback(
		(
			horizontal: "left" | "right" | null,
			vertical: "top" | "bottom" | null,
		) => {
			if (scrollIntervalRef.current !== null) {
				return; // Already scrolling
			}

			isScrollingRef.current = true;
			scrollIntervalRef.current = window.setInterval(() => {
				const cursorPos = currentCursorPosRef.current;
				if (!cursorPos) {
					return;
				}

				const { setCanvasState, canvasState } = refBus.current.props;

				// Calculate scroll deltas
				let deltaX = 0;
				let deltaY = 0;

				if (horizontal === "left") {
					deltaX = -AUTO_SCROLL_STEP_SIZE;
				} else if (horizontal === "right") {
					deltaX = AUTO_SCROLL_STEP_SIZE;
				}

				if (vertical === "top") {
					deltaY = -AUTO_SCROLL_STEP_SIZE;
				} else if (vertical === "bottom") {
					deltaY = AUTO_SCROLL_STEP_SIZE;
				}

				// Update cursor position with deltas
				const newCursorPos = {
					x: cursorPos.x + deltaX,
					y: cursorPos.y + deltaY,
				};

				// Update current cursor position reference
				currentCursorPosRef.current = newCursorPos;

				const newSelectionBounds = {
					startX: canvasState.areaSelectionState.startX,
					startY: canvasState.areaSelectionState.startY,
					endX: newCursorPos.x,
					endY: newCursorPos.y,
				};

				// Update canvas state with new scroll position and selection
				setCanvasState((prevState) => ({
					...prevState,
					minX: prevState.minX + deltaX,
					minY: prevState.minY + deltaY,
					areaSelectionState: newSelectionBounds,
					items: updateItemsWithOutline(prevState.items, newSelectionBounds),
				}));
			}, AUTO_SCROLL_INTERVAL_MS);
		},
		[],
	);

	/**
	 * Handle area selection events
	 */
	const onAreaSelection = useCallback(
		(event: AreaSelectionEvent) => {
			const { canvasState, setCanvasState } = refBus.current.props;
			const { eventType, clientX, clientY } = event;

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

					// Update cursor position for edge scrolling
					currentCursorPosRef.current = { x, y };

					// Check if we need to start edge scrolling
					const edgeProximity = detectEdgeProximity(refBus.current.props, x, y);
					if (edgeProximity.isNearEdge) {
						const isProximityChanged =
							edgeProximity.horizontal !==
								lastScrollDirectionRef.current.horizontal ||
							edgeProximity.vertical !==
								lastScrollDirectionRef.current.vertical;

						if (isProximityChanged) {
							if (scrollIntervalRef.current) {
								// Clear previous edge scroll if direction changed
								clearEdgeScroll();
							}
							// Start edge scrolling with new direction
							startEdgeScroll(edgeProximity.horizontal, edgeProximity.vertical);

							// Update last scroll direction
							lastScrollDirectionRef.current = edgeProximity;
							break;
						}
					}

					// If edge proximity is not detected, clear edge scroll
					if (!edgeProximity.isNearEdge && isScrollingRef.current) {
						clearEdgeScroll();
					}

					// Update canvas state with new selection bounds
					setCanvasState((prevState) => ({
						...prevState,
						items: updateItemsWithOutline(prevState.items, newSelectionState),
						areaSelectionState: newSelectionState,
					}));
					break;
				}

				case "End": {
					// If area selection is not active, do nothing
					if (canvasState.interactionState !== InteractionState.AreaSelection) {
						return;
					}

					// Clear edge scroll when area selection ends
					clearEdgeScroll();

					// Update items selection based on current showOutline state
					updateItemsSelection();

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
			clearEdgeScroll,
			startEdgeScroll,
		],
	);

	const onCancelAreaSelection = useCallback(() => {
		// Clear edge scroll when area selection is cancelled
		clearEdgeScroll();
		
		// Reset interaction state and remove outlines
		const { setCanvasState } = refBus.current.props;
		setCanvasState((prevState) => ({
			...prevState,
			items: applyFunctionRecursively(prevState.items, (item) => {
				if (!isSelectableData(item)) return item;
				return {
				...item,
								showOutline: false,
								};
						}),
						interactionState: InteractionState.Idle,
						areaSelectionState: {
								startX: 0,
								startY: 0,
								endX: 0,
								endY: 0,
						},
				}));
}, [clearEdgeScroll]);

	return {
		selectionState: props.canvasState.areaSelectionState,
		onAreaSelection,
		onCancelAreaSelection,
	};
};
