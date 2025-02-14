import type React from "react";
import Draggable from "./Draggable";
import type DraggableProps from "../../types/DraggableProps";
import styled from "@emotion/styled";

type CircleProps = {
	color?: string;
	diameter?: number;
};

const Circle = styled.div<CircleProps>`
    background-color: ${({ color }) => color || "black"};
    width: ${({ diameter }) => diameter || 5}px;
    height: ${({ diameter }) => diameter || 5}px;
    border-radius: 50%;
`;

type DraggablePointProps = DraggableProps & {
	color?: string;
	diameter?: number;
};

const DraggablePoint: React.FC<DraggablePointProps> = ({
	color,
	diameter = 5,
	initialPoint,
	onDragStart,
	onDrag,
	onDragEnd,
}) => {
	const radius = Math.floor(diameter / 2) + (diameter % 2 === 0 ? 0 : 1);

	const handleDragStart = (x: number, y: number) => {
		if (onDragStart) {
			onDragStart(x + radius, y + radius);
		}
	};

	const handleDrag = (x: number, y: number) => {
		if (onDrag) {
			onDrag(x + radius, y + radius);
		}
	};

	const handleDragEnd = (x: number, y: number) => {
		if (onDragEnd) {
			onDragEnd(x + radius, y + radius);
		}
	};

	return (
		<Draggable
			initialPoint={{ x: initialPoint.x - radius, y: initialPoint.y - radius }}
			onDragStart={handleDragStart}
			onDrag={handleDrag}
			onDragEnd={handleDragEnd}
		>
			<Circle color={color} diameter={diameter} />
		</Draggable>
	);
};

export default DraggablePoint;
