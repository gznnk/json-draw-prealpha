// Import React.
import type React from "react";
import { useRef, useState } from "react";

// Import types.
import type { DiagramSelectEvent } from "../types/events/DiagramSelectEvent";

// Import utils.
import { newEventId } from "../utils/common/newEventId";
import { getSvgPoint } from "../utils/math/points/getSvgPoint";

// Import constants.
import { DRAG_DEAD_ZONE } from "../constants/Constants";

/**
 * Type definition for select props
 */
export type SelectProps = {
	id: string;
	isSelected?: boolean;
	ref: React.RefObject<SVGElement>;
	onSelect?: (e: DiagramSelectEvent) => void;
};

/**
 * Custom hook to handle selection events
 *
 * @param {SelectProps} props Select props
 * @param {string} props.id ID of the element to be selectable
 * @param {DiagramType} [props.type] Type of diagram
 * @param {boolean} [props.isSelected] Whether the element is already selected
 * @param {React.RefObject<SVGElement>} props.ref Reference to the element
 * @param {(e: DiagramSelectEvent) => void} [props.onSelect] Event handler for selection
 */
export const useSelect = (props: SelectProps) => {
	const { id, isSelected, ref, onSelect } = props;
	// Flag whether pointer is pressed down in this select area
	const isPointerDown = useRef(false);
	// Flag whether dragging
	const [isDragging, setIsDragging] = useState(false);
	// Element coordinates at pointer down
	const startX = useRef(0);
	const startY = useRef(0);
	// State of selection at pointer down
	const wasSelectedOnPointerDown = useRef(false);

	/**
	 * Pointer down event handler within the select area
	 */
	const handlePointerDown = (e: React.PointerEvent<SVGElement>): void => {
		if (e.button !== 0) {
			// Do nothing for non-left clicks
			return;
		}
		// Process the event only if the ID of the element where the pointer event occurred matches the ID of this select area
		if ((e.target as HTMLElement).id === id) {
			// Set the flag that the pointer is pressed
			isPointerDown.current = true;
			// Save the current selection state
			wasSelectedOnPointerDown.current = isSelected || false;

			// Get current SVG coordinates and remember them
			const svgPoint = getSvgPoint(e.clientX, e.clientY, ref.current);
			startX.current = svgPoint.x;
			startY.current = svgPoint.y;

			// Fire select event
			onSelect?.({
				eventId: newEventId(),
				id,
				reselect: false,
			});
		}
	};

	/**
	 * Pointer move event handler within the select area
	 */
	const handlePointerMove = (e: React.PointerEvent<SVGElement>): void => {
		if (!isPointerDown.current) {
			// Do nothing if pointer is not pressed down in this select area
			return;
		}
		// Get current SVG coordinates
		const svgPoint = getSvgPoint(e.clientX, e.clientY, ref.current);

		if (
			!isDragging &&
			(Math.abs(svgPoint.x - startX.current) > DRAG_DEAD_ZONE ||
				Math.abs(svgPoint.y - startY.current) > DRAG_DEAD_ZONE)
		) {
			// Start dragging when not dragging and pointer movement exceeds a certain threshold
			setIsDragging(true);
		}
	};

	/**
	 * Pointer up event handler within the select area
	 */ const handlePointerUp = (): void => {
		if (
			isPointerDown.current &&
			!isDragging &&
			wasSelectedOnPointerDown.current
		) {
			// If pointer up after clicking (not dragging) and element was selected on pointer down, notify reselect event
			onSelect?.({
				eventId: newEventId(),
				id,
				reselect: true,
			});
		}

		// Clear flags
		setIsDragging(false);
		isPointerDown.current = false;
	};

	return {
		onPointerDown: handlePointerDown,
		onPointerMove: handlePointerMove,
		onPointerUp: handlePointerUp,
	};
};
