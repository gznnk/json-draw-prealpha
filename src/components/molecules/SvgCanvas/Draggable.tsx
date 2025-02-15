import type React from "react";
import {
	useEffect,
	useState,
	useRef,
	forwardRef,
	useImperativeHandle,
} from "react";
import type Point from "../../../types/Point";
import styled from "@emotion/styled";

const DraggableG = styled.g`
    cursor: move
`;

export type DragEvent = {
	id?: string;
	point: Point;
	reactEvent: React.PointerEvent<SVGElement>;
};

export type DraggableProps = {
	initialPoint: Point;
	onDragStart?: (e: DragEvent) => void;
	onDrag?: (e: DragEvent) => void;
	onDragEnd?: (e: DragEvent) => void;
	children?: React.ReactNode;
	ref?: SVGGElement | null;
};

const Draggable = forwardRef<SVGGElement, DraggableProps>(
	({ initialPoint, onDragStart, onDrag, onDragEnd, children }, ref) => {
		const [point, setPoint] = useState(initialPoint);

		const [isDragging, setIsDragging] = useState(false);

		const startX = useRef(0);
		const startY = useRef(0);

		const domRef = useRef<SVGGElement | null>(null);

		useImperativeHandle(ref, () => domRef.current as SVGGElement);

		useEffect(() => {
			setPoint(initialPoint);
		}, [initialPoint]);

		const getPoint = (e: React.PointerEvent<SVGElement>) => {
			return {
				x: e.clientX - startX.current,
				y: e.clientY - startY.current,
			};
		};

		const handlePointerDown = (e: React.PointerEvent<SVGElement>) => {
			setIsDragging(true);

			startX.current = e.clientX - point.x;
			startY.current = e.clientY - point.y;

			e.currentTarget.setPointerCapture(e.pointerId);

			if (onDragStart) {
				onDragStart({
					point: getPoint(e),
					reactEvent: e,
				});
			}
		};

		const handlePointerMove = (e: React.PointerEvent<SVGElement>) => {
			if (!isDragging) {
				return;
			}

			const point = getPoint(e);
			if (domRef) {
				domRef.current?.setAttribute(
					"transform",
					`translate(${point.x}, ${point.y})`,
				);
			}

			if (onDrag) {
				onDrag({
					point: point,
					reactEvent: e,
				});
			}
		};

		const handlePointerUp = (e: React.PointerEvent<SVGElement>) => {
			if (!isDragging) {
				return;
			}

			const point = getPoint(e);
			setPoint(point);

			setIsDragging(false);

			if (onDragEnd) {
				onDragEnd({
					point: point,
					reactEvent: e,
				});
			}
		};

		return (
			<DraggableG
				transform={`translate(${point.x}, ${point.y})`}
				onPointerDown={handlePointerDown}
				onPointerMove={handlePointerMove}
				onPointerUp={handlePointerUp}
				ref={domRef}
			>
				{children}
			</DraggableG>
		);
	},
);

export default Draggable;
