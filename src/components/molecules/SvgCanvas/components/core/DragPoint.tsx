import { useRef, forwardRef, useImperativeHandle } from "react";
import Draggable from "../core/Draggable";
import type { DraggableProps } from "../core/Draggable";

export type DragPointProps = DraggableProps & {
	color?: string;
	hidden?: boolean;
};

const DragPoint = forwardRef<SVGGElement, DragPointProps>(
	(
		{
			point,
			direction,
			cursor,
			visible,
			onPointerDown,
			onDragStart,
			onDrag,
			onDragEnd,
			dragPositioningFunction,
			color = "rgba(61, 90, 128, 0.8)",
			hidden = false,
		},
		ref,
	) => {
		const domRef = useRef<SVGGElement>({} as SVGGElement);
		useImperativeHandle(ref, () => domRef.current);

		if (hidden) {
			return;
		}

		return (
			<Draggable
				point={point}
				direction={direction}
				cursor={cursor}
				visible={visible}
				outline="1px dashed blue"
				outlineOffset="4px"
				onPointerDown={onPointerDown}
				onDragStart={onDragStart}
				onDrag={onDrag}
				onDragEnd={onDragEnd}
				dragPositioningFunction={dragPositioningFunction}
				ref={domRef}
			>
				<circle cx={0} cy={0} r="5" fill={color} />
			</Draggable>
		);
	},
);

export default DragPoint;
