// Import React.
import type React from "react";
import { useEffect, useRef, useState } from "react";

// Import types.
import type { DiagramType } from "../types/base/DiagramType";
import type { Point } from "../types/base/Point";
import type { DiagramDragDropEvent } from "../types/events/DiagramDragDropEvent";
import type { DiagramDragEvent } from "../types/events/DiagramDragEvent";
import type { DiagramPointerEvent } from "../types/events/DiagramPointerEvent";
import type { EventType } from "../types/events/EventType";
import type { SvgCanvasScrollEvent } from "../types/events/SvgCanvasScrollEvent";

// Import utils.
import { newEventId } from "../utils/common/newEventId";
import { getSvgPoint } from "../utils/math/points/getSvgPoint";

// Import constants.
import { DRAG_DEAD_ZONE } from "../constants/Constants";

// Import EventBus.
import { useEventBus } from "../context/EventBusContext";

// Import event names
import {
	EVENT_NAME_BROADCAST_DRAG,
	EVENT_NAME_SVG_CANVAS_SCROLL,
} from "../constants/EventNames";

/**
 * Type definition for broadcast drag event
 */
type BroadcastDragEvent = {
	eventId: string;
	eventType: EventType;
	id: string;
	type: DiagramType;
	startX: number;
	startY: number;
	endX: number;
	endY: number;
	clientX: number;
	clientY: number;
};

/**
 * Type definition for drag area props
 */
export type DragProps = {
	id: string;
	type?: DiagramType;
	x: number;
	y: number;
	ref: React.RefObject<SVGElement>;
	onPointerDown?: (e: DiagramPointerEvent) => void;
	onPointerUp?: (e: DiagramPointerEvent) => void;
	onDrag?: (e: DiagramDragEvent) => void;
	onDragOver?: (e: DiagramDragDropEvent) => void;
	onDragLeave?: (e: DiagramDragDropEvent) => void;
	onDrop?: (e: DiagramDragDropEvent) => void;
	dragPositioningFunction?: (x: number, y: number) => Point;
};

/**
 * Custom hook to create a draggable area
 *
 * @param {DragProps} props Drag area props
 * @param {string} props.id ID (set the same ID to the element to be draggable. Otherwise it will not work correctly) * @param {DiagramType} [props.type] Type of diagram
 * @param {number} props.x X coordinate
 * @param {number} props.y Y coordinate
 * @param {React.RefObject<SVGElement>} props.ref Reference to the element to be draggable * @param {(e: DiagramPointerEvent) => void} [props.onPointerDown] Event handler for pointer down
 * @param {(e: DiagramPointerEvent) => void} [props.onPointerUp] Event handler for pointer up
 * @param {(e: DiagramDragEvent) => void} [props.onDrag] Event handler for dragging
 * @param {(e: DiagramDragDropEvent) => void} [props.onDragOver] Event handler for drag over
 * @param {(e: DiagramDragDropEvent) => void} [props.onDragLeave] Event handler for drag leave * @param {(e: DiagramDragDropEvent) => void} [props.onDrop] Event handler for drop
 * @param {(x: number, y: number) => Point} [props.dragPositioningFunction] Drag position transformation function
 */
export const useDrag = (props: DragProps) => {
	const eventBus = useEventBus();
	const {
		id,
		x,
		y,
		type,
		ref,
		onPointerDown,
		onPointerUp,
		onDrag,
		onDragOver,
		onDragLeave,
		onDrop,
		dragPositioningFunction,
	} = props;
	// Flag whether dragging
	const [isDragging, setIsDragging] = useState(false);
	// Flag whether pointer is pressed down in this drag area
	const isPointerDown = useRef(false);
	// Flag whether dragging with arrow keys
	const isArrowDragging = useRef(false);
	// Flag whether drag entered
	const dragEntered = useRef(false);
	// Drag area coordinates at drag start
	const startX = useRef(0);
	const startY = useRef(0);
	// The offset between the center and the pointer.
	const offsetXBetweenCenterAndPointer = useRef(0);
	const offsetYBetweenCenterAndPointer = useRef(0);
	/**
	 * Get the drag area coordinates from the pointer position during dragging
	 *
	 * @param {number} clientX X coordinate of the pointer on the browser window
	 * @param {number} clientY Y coordinate of the pointer on the browser window
	 * @returns {Point} Drag area coordinates
	 */
	const getPointOnDrag = (clientX: number, clientY: number): Point => {
		const svgPoint = getSvgPoint(clientX, clientY, ref.current);

		let newX = svgPoint.x;
		let newY = svgPoint.y;

		// Adjust the coordinates by the offset between the center and the pointer
		newX -= offsetXBetweenCenterAndPointer.current;
		newY -= offsetYBetweenCenterAndPointer.current;
		if (dragPositioningFunction) {
			// If a drag position transformation function is specified, apply that function
			const p = dragPositioningFunction(newX, newY);
			newX = p.x;
			newY = p.y;
		}

		return {
			x: newX,
			y: newY,
		};
	};
	/**
	 * Pointer down event handler within the drag area
	 */
	const handlePointerDown = (e: React.PointerEvent<SVGElement>): void => {
		if (e.button !== 0) {
			// Do nothing for non-left clicks
			return;
		}

		// Process the event only if the ID of the element where the pointer event occurred matches the ID of this drag area
		if ((e.target as HTMLElement).id === id) {
			// Set pointer capture
			e.currentTarget.setPointerCapture(e.pointerId);

			// Set the flag that the pointer is pressed
			isPointerDown.current = true;

			// Remember the drag area coordinates at drag start
			startX.current = x;
			startY.current = y;
			// Store the offset between the center and the pointer
			const svgPoint = getSvgPoint(e.clientX, e.clientY, ref.current);
			offsetXBetweenCenterAndPointer.current = svgPoint.x - x;
			offsetYBetweenCenterAndPointer.current = svgPoint.y - y;

			// Fire pointer down event
			onPointerDown?.({
				eventId: newEventId(),
				id,
			});
		}
	};
	/**
	 * Pointer move event handler within the drag area
	 */
	const handlePointerMove = (e: React.PointerEvent<SVGElement>): void => {
		if (!isPointerDown.current) {
			// Do nothing if pointer is not pressed down in this drag area
			return;
		}

		// Get drag coordinates
		const dragPoint = getPointOnDrag(e.clientX, e.clientY);
		// Get cursor position in SVG coordinate system
		const svgCursorPoint = getSvgPoint(e.clientX, e.clientY, ref.current);
		// Generate event ID
		const eventId = newEventId();

		// Create event information during dragging
		const dragEvent = {
			eventId,
			eventType: "InProgress",
			id,
			startX: startX.current,
			startY: startY.current,
			endX: dragPoint.x,
			endY: dragPoint.y,
			cursorX: svgCursorPoint.x,
			cursorY: svgCursorPoint.y,
		} as DiagramDragEvent;

		// Create broadcast drag event information
		const broadcastDragEvent = {
			eventId,
			eventType: "InProgress",
			id,
			type: type,
			startX: startX.current,
			startY: startY.current,
			endX: dragPoint.x,
			endY: dragPoint.y,
			clientX: e.clientX,
			clientY: e.clientY,
		};
		if (
			!isDragging &&
			(Math.abs(dragPoint.x - startX.current) > DRAG_DEAD_ZONE ||
				Math.abs(dragPoint.y - startY.current) > DRAG_DEAD_ZONE)
		) {
			// Start dragging when not dragging and pointer movement exceeds a certain threshold
			onDrag?.({
				...dragEvent,
				eventType: "Start",
			});

			// Fire dragging event for handling by shapes without parent-child relationship
			eventBus.dispatchEvent(
				new CustomEvent(EVENT_NAME_BROADCAST_DRAG, {
					detail: {
						...broadcastDragEvent,
						eventType: "Start",
					},
				}),
			);

			setIsDragging(true);
			return;
		}

		if (!isDragging) {
			// Do nothing when not dragging
			return;
		}

		// Fire dragging event
		onDrag?.(dragEvent);

		// Fire dragging event for handling by shapes without parent-child relationship
		eventBus.dispatchEvent(
			new CustomEvent(EVENT_NAME_BROADCAST_DRAG, {
				detail: broadcastDragEvent,
			}),
		);
	};
	/**
	 * Pointer up event handler within the drag area
	 */
	const handlePointerUp = (e: React.PointerEvent<SVGElement>): void => {
		// Release pointer capture
		e.currentTarget.releasePointerCapture(e.pointerId);
		// Generate event ID
		const eventId = newEventId();

		if (isDragging) {
			// Get drag coordinates
			const dragPoint = getPointOnDrag(e.clientX, e.clientY); // Get cursor position in SVG coordinate system
			const svgCursorPoint = getSvgPoint(e.clientX, e.clientY, ref.current);

			// Fire drag end event if dragging was in progress
			onDrag?.({
				eventId,
				eventType: "End",
				id,
				startX: startX.current,
				startY: startY.current,
				endX: dragPoint.x,
				endY: dragPoint.y,
				cursorX: svgCursorPoint.x,
				cursorY: svgCursorPoint.y,
			});
			// Fire drag end event for handling by shapes without parent-child relationship
			eventBus.dispatchEvent(
				new CustomEvent(EVENT_NAME_BROADCAST_DRAG, {
					detail: {
						eventId,
						eventType: "End",
						id,
						type: type,
						startX: startX.current,
						startY: startY.current,
						endX: dragPoint.x,
						endY: dragPoint.y,
						clientX: e.clientX,
						clientY: e.clientY,
					} as BroadcastDragEvent,
				}),
			);
		}

		// Fire pointer up event
		onPointerUp?.({
			eventId,
			id,
		});

		// Clear flags
		setIsDragging(false);
		isPointerDown.current = false;
	};

	/**
	 * Key press event handler
	 */ const handleKeyDown = (e: React.KeyboardEvent<SVGGElement>) => {
		// Do nothing while pointer is down
		if (isPointerDown.current) {
			return;
		}

		// Generate event ID
		const eventId = newEventId();

		/**
		 * Move point by arrow keys
		 *
		 * @param dx x coordinate offset
		 * @param dy y coordinate offset
		 */
		const movePoint = (dx: number, dy: number) => {
			let newPoint = {
				x: x + dx,
				y: y + dy,
			};

			if (dragPositioningFunction) {
				newPoint = dragPositioningFunction(newPoint.x, newPoint.y);
			}

			// For keyboard operations, treat the shape's center as the cursor position
			const dragEvent = {
				eventId,
				eventType: "InProgress",
				id,
				startX: startX.current,
				startY: startY.current,
				endX: newPoint.x,
				endY: newPoint.y,
				cursorX: newPoint.x, // Use shape center as cursor position
				cursorY: newPoint.y, // Use shape center as cursor position
			} as DiagramDragEvent;

			if (!isArrowDragging.current) {
				startX.current = x;
				startY.current = y;

				onDrag?.({
					...dragEvent,
					eventType: "Start",
				});

				isArrowDragging.current = true;

				return;
			}

			onDrag?.(dragEvent);
		};

		switch (e.key) {
			case "ArrowRight":
				movePoint(1, 0);
				break;
			case "ArrowLeft":
				movePoint(-1, 0);
				break;
			case "ArrowUp":
				movePoint(0, -1);
				break;
			case "ArrowDown":
				movePoint(0, 1);
				break;
			case "Shift":
				if (isArrowDragging.current) {
					// When shift key is pressed during arrow key dragging, end the drag
					// Fire drag end event to notify SvgCanvas side of coordinate update and update coordinates
					onDrag?.({
						eventId,
						eventType: "End",
						id,
						startX: x,
						startY: y,
						endX: x,
						endY: y,
						cursorX: x, // Use shape center as cursor position
						cursorY: y, // Use shape center as cursor position
					});

					// Mark arrow key drag as ended
					isArrowDragging.current = false;
				}
				break;
			default:
				break;
		}
	};

	/**
	 * Key up event handler
	 */
	const handleKeyUp = (e: React.KeyboardEvent<SVGGElement>) => {
		// Do nothing while pointer is down
		if (isPointerDown.current) {
			return;
		}

		// Create event information for arrow key movement completion
		const dragEvent = {
			eventId: newEventId(),
			eventType: "End",
			id,
			startX: startX.current,
			startY: startY.current,
			endX: x,
			endY: y,
			cursorX: x, // Use shape center as cursor position
			cursorY: y, // Use shape center as cursor position
		} as DiagramDragEvent;

		if (isArrowDragging.current) {
			if (e.key === "Shift") {
				// When shift key is released during arrow key dragging, fire drag end event
				// and notify SvgCanvas side to update coordinates once
				onDrag?.(dragEvent);
				onDrag?.({
					...dragEvent,
					eventType: "Start",
				});
			}
			if (
				e.key === "ArrowRight" ||
				e.key === "ArrowLeft" ||
				e.key === "ArrowUp" ||
				e.key === "ArrowDown"
			) {
				// When arrow key is released, fire drag end event to notify SvgCanvas side of coordinate update and update coordinates
				onDrag?.(dragEvent); // Mark arrow key drag as ended
				isArrowDragging.current = false;
			}
		}
	};

	// Register global broadcast drag event listener
	// Use ref to hold referenced values to avoid frequent handler generation
	const refBusVal = {
		// Properties
		id,
		x,
		y,
		type,
		ref,
		onDrag,
		onDragOver,
		onDragLeave,
		onDrop,
		// Internal variables and functions
		getPointOnDrag,
	};
	const refBus = useRef(refBusVal);
	refBus.current = refBusVal;

	useEffect(() => {
		let handleBroadcastDrag: (e: CustomEvent) => void;
		const { onDragOver, onDrop } = refBus.current;

		if (onDragOver || onDrop) {
			handleBroadcastDrag = (e: CustomEvent) => {
				// Get reference values via refBus
				const { id, x, y, type, ref, onDragOver, onDragLeave } = refBus.current;
				const customEvent = e as CustomEvent<BroadcastDragEvent>;

				// Create drag & drop event information
				const dragDropEvent = {
					eventId: customEvent.detail.eventId,
					dropItem: {
						id: customEvent.detail.id,
						type: customEvent.detail.type,
						x: customEvent.detail.startX,
						y: customEvent.detail.startY,
					},
					dropTargetItem: {
						id,
						type,
						x,
						y,
					},
				};

				if (
					isPointerOver(
						ref,
						customEvent.detail.clientX,
						customEvent.detail.clientY,
					)
				) {
					if (customEvent.detail.eventType === "End") {
						onDrop?.(dragDropEvent);
					} else {
						if (!dragEntered.current) {
							dragEntered.current = true;
							onDragOver?.(dragDropEvent);
						}
					}
				} else if (dragEntered.current) {
					dragEntered.current = false;
					onDragLeave?.(dragDropEvent);
				}
			};
			eventBus.addEventListener(EVENT_NAME_BROADCAST_DRAG, handleBroadcastDrag);
		}

		return () => {
			if (handleBroadcastDrag) {
				eventBus.removeEventListener(
					EVENT_NAME_BROADCAST_DRAG,
					handleBroadcastDrag,
				);
			}
		};
	}, [eventBus]);

	/**
	 * Handle SvgCanvas scroll event.
	 */
	useEffect(() => {
		let handleSvgCanvasScroll: (e: Event) => void;
		if (isDragging) {
			handleSvgCanvasScroll = (e: Event) => {
				const { id, getPointOnDrag, onDrag } = refBus.current;

				const customEvent = e as CustomEvent<SvgCanvasScrollEvent>;

				const dragPoint = getPointOnDrag(
					customEvent.detail.clientX,
					customEvent.detail.clientY,
				);
				// Get cursor position in SVG coordinate system
				const svgCursorPoint = getSvgPoint(
					customEvent.detail.clientX,
					customEvent.detail.clientY,
					ref.current,
				);

				onDrag?.({
					eventId: newEventId(),
					eventType: "InProgress",
					id,
					startX: startX.current,
					startY: startY.current,
					endX: dragPoint.x,
					endY: dragPoint.y,
					cursorX: svgCursorPoint.x,
					cursorY: svgCursorPoint.y,
				});
			};
			document.addEventListener(
				EVENT_NAME_SVG_CANVAS_SCROLL,
				handleSvgCanvasScroll,
				true,
			);
		}
		return () => {
			if (handleSvgCanvasScroll) {
				document.removeEventListener(
					EVENT_NAME_SVG_CANVAS_SCROLL,
					handleSvgCanvasScroll,
					true,
				);
			}
		};
	}, [isDragging, ref]);
	return {
		onPointerDown: handlePointerDown,
		onPointerMove: handlePointerMove,
		onPointerUp: handlePointerUp,
		onKeyDown: handleKeyDown,
		onKeyUp: handleKeyUp,
	};
};

/**
 * Determine whether the pointer is over this drag area
 * When pointer is captured, pointer-related events do not fire on other elements, so we need to check manually
 *
 * @param {React.RefObject<SVGElement>} ref Reference to the drag area
 * @param {number} clientX Pointer X coordinate
 * @param {number} clientY Pointer Y coordinate
 * @returns {boolean} Whether the pointer is over this drag area
 */
const isPointerOver = (
	ref: React.RefObject<SVGElement>,
	clientX: number,
	clientY: number,
): boolean => {
	const svgCanvas = ref.current?.ownerSVGElement as SVGSVGElement;
	if (!svgCanvas) {
		return false;
	}
	const svgPoint = svgCanvas.createSVGPoint();

	if (svgPoint) {
		svgPoint.x = clientX;
		svgPoint.y = clientY;
		const svg = ref.current;

		if (svg instanceof SVGGeometryElement) {
			const transformedPoint = svgPoint.matrixTransform(
				svg.getScreenCTM()?.inverse(),
			);
			return (
				svg.isPointInFill(transformedPoint) ||
				svg.isPointInStroke(transformedPoint)
			);
		}
	}
	return false;
};
