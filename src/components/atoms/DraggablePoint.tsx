import type React from "react";
import Draggable from "./Draggable";
import type DraggableProps from "../../types/DraggableProps";
import styled from "@emotion/styled";

type CircleProps = {
	color: string;
	hoverColor: string;
	diameter: number;
};

const Circle = styled.div<CircleProps>`
    background-color: ${({ color }) => color};
    width: ${({ diameter }) => diameter}px;
    height: ${({ diameter }) => diameter}px;
    border-radius: 50%;
    &:hover {
        background-color: ${({ hoverColor }) => hoverColor};
    }
`;

type DraggablePointProps = DraggableProps & {
	color?: string;
	hoverColor?: string;
	diameter?: number;
};

const DraggablePoint: React.FC<DraggablePointProps> = ({
	color = "black",
	hoverColor = "none",
	diameter = 9,
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
			<Circle color={color} hoverColor={hoverColor} diameter={diameter} />
		</Draggable>
	);
};

export default DraggablePoint;
