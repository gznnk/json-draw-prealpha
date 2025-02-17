import type React from "react";
import {
	useEffect,
	useState,
	useRef,
	forwardRef,
	useImperativeHandle,
} from "react";
import type { Point, PointerDownEvent, DragEvent } from "../../types";
import { DragDirection } from "../../types";
import styled from "@emotion/styled";

type DraggableGProps = {
	cursor: string;
	visibility: string;
	outline?: string;
	outlineOffset?: string;
};

const DraggableG = styled.g<DraggableGProps>`
    cursor: ${({ cursor }) => cursor};
    visibility: ${({ visibility }) => visibility};
    &:focus {
        outline: ${({ outline }) => outline};
        outline-offset: ${({ outlineOffset }) => outlineOffset};
    }
`;

export type DraggableProps = {
	key?: string;
	id?: string;
	initialPoint: Point;
	direction?: DragDirection;
	cursor?: string;
	visible?: boolean;
	tabIndex?: number;
	outline?: string;
	outlineOffset?: string;
	ref?: SVGGElement | null;
	onPointerDown?: (e: PointerDownEvent) => void;
	onDragStart?: (e: DragEvent) => void;
	onDrag?: (e: DragEvent) => void;
	onDragEnd?: (e: DragEvent) => void;
	children?: React.ReactNode;
};

const Draggable = forwardRef<SVGGElement, DraggableProps>(
	(
		{
			key,
			id,
			initialPoint,
			direction = DragDirection.All,
			cursor = "move",
			visible = true,
			tabIndex = 0,
			outline = "none",
			outlineOffset = "0px",
			onPointerDown,
			onDragStart,
			onDrag,
			onDragEnd,
			children,
		},
		ref,
	) => {
		const [point, setPoint] = useState(initialPoint);
		const [isDragging, setIsDragging] = useState(false);

		const startX = useRef(0);
		const startY = useRef(0);

		const domRef = useRef<SVGGElement>({} as SVGGElement);

		useImperativeHandle(ref, () => domRef.current);

		useEffect(() => {
			setPoint(initialPoint);
		}, [initialPoint]);

		const getPoint = (e: React.PointerEvent<SVGElement>) => {
			const x =
				direction === DragDirection.Vertical
					? point.x
					: e.clientX - startX.current;
			const y =
				direction === DragDirection.Horizontal
					? point.y
					: e.clientY - startY.current;

			return {
				x: Math.floor(x),
				y: Math.floor(y),
			};
		};

		const handlePointerDown = (e: React.PointerEvent<SVGElement>) => {
			setIsDragging(true);

			startX.current = e.clientX - point.x;
			startY.current = e.clientY - point.y;

			e.currentTarget.setPointerCapture(e.pointerId);

			const event = {
				point: getPoint(e),
				reactEvent: e,
			};

			onPointerDown?.(event);
			onDragStart?.(event);
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

			onDrag?.({
				point: point,
				reactEvent: e,
			});
		};

		const handlePointerUp = (e: React.PointerEvent<SVGElement>) => {
			if (!isDragging) {
				return;
			}

			const point = getPoint(e);
			setPoint(point);

			setIsDragging(false);

			onDragEnd?.({
				point: point,
				reactEvent: e,
			});
		};

		const handleKeyDown = (e: React.KeyboardEvent<SVGGElement>) => {
			if (e.key === "ArrowRight") {
				if (direction === DragDirection.Vertical) {
					return;
				}

				const newPoint = {
					x: point.x + 1,
					y: point.y,
				};

				onDragStart?.({ point });
				onDrag?.({
					point: newPoint,
				});
				setPoint(newPoint);
			}
			if (e.key === "ArrowLeft") {
				if (direction === DragDirection.Vertical) {
					return;
				}

				const newPoint = {
					x: point.x - 1,
					y: point.y,
				};

				onDragStart?.({ point });
				onDrag?.({
					point: newPoint,
				});
				setPoint(newPoint);
			}
			if (e.key === "ArrowUp") {
				if (direction === DragDirection.Horizontal) {
					return;
				}

				const newPoint = {
					x: point.x,
					y: point.y - 1,
				};

				onDragStart?.({ point });
				onDrag?.({
					point: newPoint,
				});
				setPoint(newPoint);
			}
			if (e.key === "ArrowDown") {
				if (direction === DragDirection.Horizontal) {
					return;
				}

				const newPoint = {
					x: point.x,
					y: point.y + 1,
				};

				onDragStart?.({ point });
				onDrag?.({
					point: newPoint,
				});
				setPoint(newPoint);
			}
		};

		const handleKeyUp = (e: React.KeyboardEvent<SVGGElement>) => {
			if (
				e.key === "ArrowRight" ||
				e.key === "ArrowLeft" ||
				e.key === "ArrowUp" ||
				e.key === "ArrowDown"
			) {
				onDragEnd?.({
					point,
				});
			}
		};

		return (
			<DraggableG
				key={key}
				id={id}
				transform={`translate(${point.x}, ${point.y})`}
				onPointerDown={handlePointerDown}
				onPointerMove={handlePointerMove}
				onPointerUp={handlePointerUp}
				onKeyDown={handleKeyDown}
				onKeyUp={handleKeyUp}
				tabIndex={tabIndex}
				cursor={cursor}
				ref={domRef}
				visibility={visible ? "visible" : "hidden"}
				outline={outline}
				outlineOffset={outlineOffset}
			>
				{children}
			</DraggableG>
		);
	},
);

export default Draggable;
