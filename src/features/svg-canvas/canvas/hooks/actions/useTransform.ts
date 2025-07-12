// Import React.
import { useCallback, useRef } from "react";

// Import types related to SvgCanvas.
import type { Diagram } from "../../../types/data/catalog/Diagram";
import type { DiagramTransformEvent } from "../../../types/events/DiagramTransformEvent";
import type { EventType } from "../../../types/events/EventType";
import type { CanvasHooksProps, SvgCanvasState } from "../../SvgCanvasTypes";
import { InteractionState } from "../../SvgCanvasTypes";

// Import hooks related to SvgCanvas.
import { useAutoEdgeScroll } from "../navigation/useAutoEdgeScroll";

// Import functions related to SvgCanvas.
import { DiagramRegistry } from "../../../registry";
import type { ConnectPointData } from "../../../types/data/shapes/ConnectPointData";
import { refreshConnectLines } from "../../../utils/shapes/connectLine/refreshConnectLines";
import { isConnectableData } from "../../../utils/validation/isConnectableData";
import { addHistory } from "../../utils/addHistory";
import { createItemMap } from "../../utils/createItemMap";
import { isDiagramChangingEvent } from "../../utils/isDiagramChangingEvent";
import { isHistoryEvent } from "../../utils/isHistoryEvent";
import { svgCanvasStateToData } from "../../utils/svgCanvasStateToData";
import { updateOutlineOfGroup } from "../../utils/updateOutlineOfGroup";

// Import utility functions for transformation.
import type { GroupData } from "../../../types/data/shapes/GroupData";
import { getSelectedItems } from "../../../utils/common/getSelectedItems";
import { degreesToRadians } from "../../../utils/math/common/degreesToRadians";
import { rotatePoint } from "../../../utils/math/points/rotatePoint";
import { isItemableData } from "../../../utils/validation/isItemableData";
import { isTransformativeData } from "../../../utils/validation/isTransformativeData";

/**
 * Updates connect points of a diagram item if it's connectable.
 * This function can be generalized for future use.
 */
const updateDiagramConnectPoints = (item: Diagram): void => {
	if (isConnectableData(item)) {
		const calculator = DiagramRegistry.getConnectPointCalculator(item.type);
		if (calculator) {
			// Update the connect points of the item.
			item.connectPoints = calculator(item).map((c) => ({
				...c,
				type: "ConnectPoint",
			})) as ConnectPointData[];
		}
	}
};

/**
 * Determines if an item should be in transforming state based on event type.
 * Pure function for consistent state management.
 */
const getIsTransformingState = (eventType: EventType): boolean => {
	return eventType === "Start" || eventType === "InProgress";
};

/**
 * Custom hook to handle transform events on the canvas.
 */
export const useTransform = (props: CanvasHooksProps) => {
	// Get the auto edge scroll function and scrolling state to handle canvas auto scrolling.
	const { autoEdgeScroll, isAutoScrolling } = useAutoEdgeScroll(props);

	// Create references bypass to avoid function creation in every render.
	const refBusVal = {
		props,
		autoEdgeScroll,
		isAutoScrolling,
	};
	const refBus = useRef(refBusVal);
	refBus.current = refBusVal;

	// Reference to store the canvas state at the start of transform for connect line updates.
	const startCanvasState = useRef<SvgCanvasState | undefined>(undefined);
	// Reference to store selected item IDs at the start of transform for performance.
	const multiSelectedItemIds = useRef<Set<string>>(new Set());
	// Reference to store initial items at the start of transform.
	const initialItemsMap = useRef<Map<string, Diagram>>(new Map());

	const transformChild = useCallback(
		(
			item: Diagram,
			e: DiagramTransformEvent,
			transformedDiagrams: Diagram[],
			ancestors: string[] = [],
			topLevelGroupIds: Set<string> = new Set(),
		): Diagram => {
			const initialItem = initialItemsMap.current.get(item.id);
			if (!initialItem) {
				// If the item is not found in the initial items map, return the child item as is.
				return item;
			}
			const groupScaleX = e.endShape.width / e.startShape.width;
			const groupScaleY = e.endShape.height / e.startShape.height;
			const inversedItemCenter = rotatePoint(
				initialItem.x,
				initialItem.y,
				e.startShape.x,
				e.startShape.y,
				degreesToRadians(-e.startShape.rotation),
			);
			const dx =
				(inversedItemCenter.x - e.startShape.x) *
				e.startShape.scaleX *
				e.endShape.scaleX;
			const dy =
				(inversedItemCenter.y - e.startShape.y) *
				e.startShape.scaleY *
				e.endShape.scaleY;

			const newDx = dx * groupScaleX;
			const newDy = dy * groupScaleY;

			let newCenter = {
				x: e.endShape.x + newDx,
				y: e.endShape.y + newDy,
			};
			newCenter = rotatePoint(
				newCenter.x,
				newCenter.y,
				e.endShape.x,
				e.endShape.y,
				degreesToRadians(e.endShape.rotation),
			);

			let newItem: Diagram;
			if (isTransformativeData(initialItem)) {
				const rotationDiff = e.endShape.rotation - e.startShape.rotation;
				const newRotation = initialItem.rotation + rotationDiff;
				newItem = {
					...item,
					x: newCenter.x,
					y: newCenter.y,
					width: initialItem.width * groupScaleX,
					height: initialItem.height * groupScaleY,
					rotation: newRotation,
					scaleX: e.endShape.scaleX,
					scaleY: e.endShape.scaleY,
					isTransforming: getIsTransformingState(e.eventType),
					items: isItemableData(initialItem)
						? transformRecursively(
								initialItem.items ?? [],
								e,
								transformedDiagrams,
								true,
								[...ancestors, item.id],
								topLevelGroupIds,
							)
						: undefined,
				} as Diagram;

				// Update the connect points of the transformed item.
				updateDiagramConnectPoints(newItem);
				if (isConnectableData(newItem)) {
					transformedDiagrams.push(newItem);
				}
			} else {
				newItem = {
					...item,
					x: newCenter.x,
					y: newCenter.y,
				};

				// Update the connect points of the transformed item.
				updateDiagramConnectPoints(newItem);
				if (isConnectableData(newItem)) {
					transformedDiagrams.push(newItem);
				}
			}

			return newItem;
		},
		[],
	);

	const transformRecursively = useCallback(
		(
			items: Diagram[],
			e: DiagramTransformEvent,
			transformedDiagrams: Diagram[],
			isTransformedChild: boolean,
			ancestors: string[] = [],
			topLevelGroupIds: Set<string> = new Set(),
		): Diagram[] => {
			return items.map((item) => {
				if (item.id === e.id) {
					// Apply the new shape to the item.
					const newItem = {
						...item,
						...e.endShape,
					};

					// Update isTransforming flag if it's transformative data
					if (isTransformativeData(newItem)) {
						newItem.isTransforming = getIsTransformingState(e.eventType);
					}

					// Transform its children recursively.
					if (isItemableData(newItem)) {
						newItem.items = transformRecursively(
							newItem.items ?? [],
							e,
							transformedDiagrams,
							true,
							[...ancestors, item.id],
							topLevelGroupIds,
						);
					}

					// Update the connect points of the transformed item.
					updateDiagramConnectPoints(newItem);
					if (isConnectableData(newItem)) {
						transformedDiagrams.push(newItem);
					}

					// Add top-level group to the set if this is a transformed item and we have ancestors
					if (ancestors.length > 0 && ancestors[0]) {
						topLevelGroupIds.add(ancestors[0]);
					}

					return newItem;
				}
				// If the item is multi-selected or a child of a transformed item, transform it.
				if (isTransformedChild || multiSelectedItemIds.current.has(item.id)) {
					const transformedChild = transformChild(
						item,
						e,
						transformedDiagrams,
						ancestors,
						topLevelGroupIds,
					);

					// Add top-level group to the set if this is a transformed item and we have ancestors
					if (ancestors.length > 0 && ancestors[0]) {
						topLevelGroupIds.add(ancestors[0]);
					}

					return transformedChild;
				}
				// If the item has children, recursively transform them.
				if (isItemableData(item)) {
					return {
						...item,
						items: transformRecursively(
							item.items ?? [],
							e,
							transformedDiagrams,
							false,
							[...ancestors, item.id],
							topLevelGroupIds,
						),
					};
				}
				return item; // Return the child item unchanged if not selected.
			});
		},
		[transformChild],
	);

	// Return a callback function to handle the transform event.
	return useCallback(
		(e: DiagramTransformEvent) => {
			// Bypass references to avoid function creation in every render.
			const {
				props: { setCanvasState, onDataChange },
				autoEdgeScroll,
				isAutoScrolling,
			} = refBus.current;

			// If auto scrolling is active and this event is not from auto edge scroll,
			// ignore diagram transformation processing but continue auto edge scroll detection
			if (isAutoScrolling && !e.isFromAutoEdgeScroll) {
				// Auto scroll if the cursor is near the edges.
				autoEdgeScroll({
					cursorX: e.cursorX,
					cursorY: e.cursorY,
				});
				return;
			}

			// Update the canvas state based on the transform event.
			setCanvasState((prevState) => {
				// Store the canvas state and initial child items at the start of transform
				if (e.eventType === "Start") {
					// Store the current canvas state for connect line updates
					startCanvasState.current = prevState;

					// Store selected item IDs for performance
					const selectedItems = getSelectedItems(prevState.items);
					if (selectedItems.length > 1) {
						// If multiple items are selected, store their IDs for multi-selection.
						multiSelectedItemIds.current = new Set(
							selectedItems.map((item) => item.id),
						);
					}
					// Store initial items
					initialItemsMap.current = createItemMap(prevState.items);
				}

				// Transformed diagrams to be updated.
				const transformedDiagrams: Diagram[] = [];
				const topLevelGroupIds = new Set<string>();

				let newState = {
					...prevState,
					items: transformRecursively(
						prevState.items,
						e,
						transformedDiagrams,
						false,
						[],
						topLevelGroupIds,
					),
					isDiagramChanging: isDiagramChangingEvent(e.eventType),
					interactionState:
						e.eventType === "Start" || e.eventType === "InProgress"
							? InteractionState.Transforming
							: InteractionState.Normal,
					multiSelectGroup: prevState.multiSelectGroup
						? ({
								...prevState.multiSelectGroup,
								// Update the multi-select group with the new shape.
								...e.endShape,
							} as GroupData)
						: undefined,
				} as SvgCanvasState;

				// If the event has minX and minY, update the canvas state
				if (e.minX !== undefined && e.minY !== undefined) {
					newState.minX = e.minX;
					newState.minY = e.minY;
				}

				// Refresh the connect lines for the transformed diagrams.
				newState = refreshConnectLines(
					transformedDiagrams,
					newState,
					startCanvasState.current,
				);

				// Update outline of top-level groups that contain transformed diagrams
				newState.items = newState.items.map((item) => {
					if (item.type === "Group" && topLevelGroupIds.has(item.id)) {
						return updateOutlineOfGroup(item);
					}
					return item;
				});

				if (isHistoryEvent(e.eventType)) {
					// Add a new history entry.
					newState.lastHistoryEventId = e.eventId;
					newState = addHistory(prevState, newState);

					// Notify the data change.
					onDataChange?.(svgCanvasStateToData(newState));
				}

				// Clean up the stored items at the end of transform
				if (e.eventType === "End") {
					startCanvasState.current = undefined;
					initialItemsMap.current.clear();
					multiSelectedItemIds.current.clear();
				}

				return newState;
			});
			// Auto scroll if the cursor is near the edges.
			autoEdgeScroll({
				cursorX: e.cursorX ?? e.endShape.x,
				cursorY: e.cursorY ?? e.endShape.y,
			});
		},
		[transformRecursively],
	);
};
