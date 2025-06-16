// Import React.
import type React from "react";
import { memo, useRef } from "react";

// Import hooks.
import type { DragProps } from "../../../hooks/useDrag";
import { useDrag } from "../../../hooks/useDrag";

/**
 * Props for the DragLine component.
 */
type DragLineProps = Omit<DragProps, "ref"> & {
	startX: number;
	startY: number;
	endX: number;
	endY: number;
	cursor: string;
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
	eventBus,
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
		eventBus,
		onPointerDown,
		onClick,
		onDrag,
		dragPositioningFunction,
	});

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
			{...dragProps}
		/>
	);
};

export const DragLine = memo(DragLineComponent);
