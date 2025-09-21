import type React from "react";
import { memo, useRef } from "react";

import { Circle } from "./DragPointStyled";
import { useDrag } from "../../../hooks/useDrag";
import { useHover } from "../../../hooks/useHover";
import type { DiagramType } from "../../../types/core/DiagramType";
import type { Point } from "../../../types/core/Point";
import type { DiagramDragDropEvent } from "../../../types/events/DiagramDragDropEvent";
import type { DiagramDragEvent } from "../../../types/events/DiagramDragEvent";
import type { DiagramHoverChangeEvent } from "../../../types/events/DiagramHoverChangeEvent";

/**
 * Props for the DragPoint component.
 */
export type DragPointProps = {
	id: string;
	type?: DiagramType;
	x: number;
	y: number;
	radius?: number;
	stroke?: string;
	fill?: string;
	cursor?: string;
	outline?: string;
	isTransparent?: boolean;
	hidden?: boolean;
	onDrag?: (e: DiagramDragEvent) => void;
	onDragOver?: (e: DiagramDragDropEvent) => void;
	onDragLeave?: (e: DiagramDragDropEvent) => void;
	onDrop?: (e: DiagramDragDropEvent) => void;
	onHoverChange?: (e: DiagramHoverChangeEvent) => void;
	dragPositioningFunction?: (x: number, y: number) => Point;
};

/**
 * Draggable point component.
 */
const DragPointComponent: React.FC<DragPointProps> = ({
	id,
	type,
	x,
	y,
	radius = 5,
	stroke = "rgba(107, 114, 128, 0.8)",
	fill = "rgba(107, 114, 128, 0.8)",
	cursor = "move",
	outline = "1px rgba(107, 114, 128, 0.8) dashed",
	isTransparent = false,
	hidden = false,
	onDrag,
	onDragOver,
	onDragLeave,
	onDrop,
	onHoverChange,
	dragPositioningFunction,
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
		dragPositioningFunction,
	});
	const hoverProps = useHover({
		id,
		onHoverChange,
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
			{...hoverProps}
		/>
	);
};

export const DragPoint = memo(DragPointComponent);
