import type React from "react";
import { useState, useRef } from "react";
import styled from "@emotion/styled";
import type Point from "../../types/Point";
import type DraggableProps from "../../types/DraggableProps";

const DraggableDiv = styled.div`
    position: absolute;
    &:hover {
        cursor: move;
    }
`;

type Props = DraggableProps & {
	initialPoint: Point;
	children: React.ReactNode;
	onDragStart?: (x: number, y: number) => void;
	onDrag?: (x: number, y: number) => void;
	onDragEnd?: (x: number, y: number) => void;
};

const Draggable: React.FC<Props> = ({
	initialPoint,
	children,
	onDragStart,
	onDrag,
	onDragEnd,
}) => {
	const [x, setX] = useState(initialPoint.x);
	const [y, setY] = useState(initialPoint.y);

	const grabX = useRef(0);
	const grabY = useRef(0);

	const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
		grabX.current = e.clientX - x;
		grabY.current = e.clientY - y;

		// ゴーストを非表示にする
		e.dataTransfer.setData("text/plain", "");
		e.dataTransfer.setDragImage(new Image(), 0, 0);

		if (onDragStart) {
			onDragStart(x, y);
		}
	};

	const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
		const newX = e.clientX - grabX.current;
		const newY = e.clientY - grabY.current;

		setX(newX);
		setY(newY);

		if (onDrag) {
			onDrag(newX, newY);
		}
	};

	const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
		const newX = e.clientX - grabX.current;
		const newY = e.clientY - grabY.current;

		setX(newX);
		setY(newY);

		if (onDragEnd) {
			onDragEnd(newX, newY);
		}
	};

	return (
		<DraggableDiv
			draggable
			onDragStart={handleDragStart}
			onDrag={handleDrag}
			onDragEnd={handleDragEnd}
			style={{ left: x, top: y }}
		>
			{children}
		</DraggableDiv>
	);
};

export default Draggable;
