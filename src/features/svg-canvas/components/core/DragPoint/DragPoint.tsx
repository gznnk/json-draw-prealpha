// Import React.
import type React from "react";
import { memo, useRef } from "react";

// Import hooks
import type { DragProps } from "../../../hooks";
import { useDrag } from "../../../hooks";

// Import local module files.
import { Circle } from "./DragPointStyled";

/**
 * Props for the DragPoint component.
 */
export type DragPointProps = Omit<DragProps, "ref"> & {
	radius?: number;
	stroke?: string;
	fill?: string;
	cursor?: string;
	outline?: string;
	isTransparent?: boolean;
	hidden?: boolean;
};

/**
 * Draggable point component.
 */
const DragPointComponent: React.FC<DragPointProps> = ({
	id,
	type,
	x,
	y,
	onDrag,
	onDragOver,
	onDragLeave,
	onDrop,
	onHover,
	dragPositioningFunction,
	radius = 5,
	stroke = "rgba(100, 149, 237, 0.8)",
	fill = "rgba(100, 149, 237, 0.8)",
	cursor = "move",
	outline = "1px rgba(100, 149, 237, 0.8) dashed",
	isTransparent = false,
	hidden = false,
}) => {
	const svgRef = useRef<SVGCircleElement>({} as SVGCircleElement);

	const dragProps = useDrag({
		id,
		type,
		x,
		y,
		ref: svgRef,
		onDrag,
		onDragOver,
		onDragLeave,
		onDrop,
		onHover,
		dragPositioningFunction,
	});

	if (hidden) {
		return;
	}

	return (
		<Circle
			id={id}
			cx={x}
			cy={y}
			r={radius}
			stroke={stroke}
			fill={fill}
			cursor={cursor}
			outline={outline}
			tabIndex={0}
			isTransparent={isTransparent}
			ref={svgRef}
			{...dragProps}
		/>
	);
};

export const DragPoint = memo(DragPointComponent);
