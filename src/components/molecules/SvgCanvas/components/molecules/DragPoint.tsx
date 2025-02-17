import type React from "react";
import Draggable from "../atoms/Draggable";
import type { DraggableProps } from "../atoms/Draggable";

export type DragPointProps = DraggableProps & {
	color?: string;
	visible?: boolean;
	hidden?: boolean;
};

const DragPoint: React.FC<DragPointProps> = ({
	initialPoint,
	direction,
	cursor,
	visible,
	onDragStart,
	onDrag,
	onDragEnd,
	onFocus,
	onBulr,
	color = "rgba(61, 90, 128, 0.8)",
	hidden = false,
}) => {
	if (hidden) {
		return;
	}

	return (
		<Draggable
			initialPoint={initialPoint}
			direction={direction}
			cursor={cursor}
			visible={visible}
			onDragStart={onDragStart}
			onDrag={onDrag}
			onDragEnd={onDragEnd}
			onFocus={onFocus}
			onBulr={onBulr}
		>
			<circle cx={0} cy={0} r="5" fill={color} />
		</Draggable>
	);
};

export default DragPoint;
