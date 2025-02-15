import type React from "react";
import { useEffect, useState, useRef } from "react";
import styled from "@emotion/styled";
import type Point from "../../types/Point";

const DraggableDiv = styled.div`
    position: absolute;
`;

export type DraggableProps = {
	initialPoint: Point;
	children?: React.ReactNode;
	onDragStart?: (x: number, y: number) => void;
	onDrag?: (x: number, y: number) => void;
	onDragEnd?: (x: number, y: number) => void;
};

const Draggable: React.FC<DraggableProps> = ({
	initialPoint,
	children,
	onDragStart,
	onDrag,
	onDragEnd,
}) => {
	const [x, setX] = useState(initialPoint.x);
	const [y, setY] = useState(initialPoint.y);

	const startX = useRef(0);
	const startY = useRef(0);

	useEffect(() => {
		setX(initialPoint.x);
		setY(initialPoint.y);
	}, [initialPoint]);

	const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
		startX.current = e.clientX - x;
		startY.current = e.clientY - y;

		// ゴーストを非表示にする
		e.dataTransfer.setData("text/plain", "");
		e.dataTransfer.setDragImage(new Image(), 0, 0);

		if (onDragStart) {
			onDragStart(x, y);
		}
	};

	const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
		const newX = e.clientX - startX.current;
		const newY = e.clientY - startY.current;

		setX(newX);
		setY(newY);

		if (onDrag) {
			onDrag(newX, newY);
		}
	};

	const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
		const newX = e.clientX - startX.current;
		const newY = e.clientY - startY.current;

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
