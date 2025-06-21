// Import React.
import type React from "react";
import { memo, useRef } from "react";

// Import hooks.
import type { DragProps } from "../../../hooks/useDrag";
import { useDrag } from "../../../hooks/useDrag";
import { useClick } from "../../../hooks/useClick";

// Import types.
import type { DiagramClickEvent } from "../../../types/events/DiagramClickEvent";

// Import utils.
import { mergeProps } from "../../../utils/common/mergeProps";

/**
 * Props for the DragLine component.
 */
type DragLineProps = Omit<DragProps, "ref"> & {
	startX: number;
	startY: number;
	endX: number;
	endY: number;
	cursor: string;
	onClick?: (e: DiagramClickEvent) => void;
};

/**
 * Draggable line component.
 */
const DragLineComponent: React.FC<DragLineProps> = ({
	id,
	x,
	y,
	startX,
	startY,
	endX,
	endY,
	cursor,
	onPointerDown,
	onClick,
	onDrag,
	dragPositioningFunction,
}) => {
	const svgRef = useRef<SVGLineElement>({} as SVGLineElement);

	const dragProps = useDrag({
		id,
		x,
		y,
		ref: svgRef,
		onPointerDown,
		onDrag,
		dragPositioningFunction,
	});
	const clickProps = useClick({
		id,
		x,
		y,
		ref: svgRef,
		onClick,
	});

	// Compose props for line element
	const composedProps = mergeProps(dragProps, clickProps);

	return (
		<line
			id={id}
			x1={startX}
			y1={startY}
			x2={endX}
			y2={endY}
			stroke="transparent"
			strokeWidth={5}
			cursor={cursor}
			ref={svgRef}
			{...composedProps}
		/>
	);
};

export const DragLine = memo(DragLineComponent);
