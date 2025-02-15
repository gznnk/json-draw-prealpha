import type React from "react";
import { useEffect, useState, useRef } from "react";
import Draggable from "./Draggable";
import type { DraggableProps } from "./Draggable";

export type DragPointProps = DraggableProps & {
	color?: string;
	hidden?: boolean;
};

const DragPoint: React.FC<DragPointProps> = ({
	initialPoint,
	onDragStart,
	onDrag,
	onDragEnd,
	// color = "rgba(157, 204, 224, 0.8)",
	color = "red",
	hidden = false,
}) => {
	if (hidden) {
		return;
	}

	return (
		<Draggable
			initialPoint={initialPoint}
			onDragStart={onDragStart}
			onDrag={onDrag}
			onDragEnd={onDragEnd}
		>
			<circle cx={0} cy={0} r="4" fill={color} />
		</Draggable>
	);
};

export default DragPoint;
