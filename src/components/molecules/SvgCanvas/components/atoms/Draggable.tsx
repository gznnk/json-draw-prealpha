import type React from "react";
import {
	useEffect,
	useState,
	useRef,
	forwardRef,
	useImperativeHandle,
} from "react";
import type { Point } from "../../types";
import styled from "@emotion/styled";

type DraggableGProps = {
	cursor: string;
	visibility: string;
	focusOutline: string;
};

const DraggableG = styled.g<DraggableGProps>`
    cursor: ${({ cursor }) => cursor};
    visibility: ${({ visibility }) => visibility};
    &:focus {
        outline: ${({ focusOutline }) => focusOutline};
        outline-offset: 4px;
    }
`;

export enum DragDirection {
	All = 0,
	Horizontal = 1,
	Vertical = 2,
}

export type DragEvent = {
	id?: string;
	point: Point;
	reactEvent?: React.PointerEvent<SVGElement>;
};

export type DraggableProps = {
	id?: string;
	initialPoint: Point;
	direction?: DragDirection;
	cursor?: string;
	visible?: boolean;
	tabIndex?: number;
	focusOutline?: string;
	ref?: SVGGElement | null;
	onDragStart?: (e: DragEvent) => void;
	onDrag?: (e: DragEvent) => void;
	onDragEnd?: (e: DragEvent) => void;
	onFocus?: (e: React.FocusEvent<SVGGElement>) => void;
	onBulr?: (e: React.FocusEvent<SVGGElement>) => void;
	children?: React.ReactNode;
};

const Draggable = forwardRef<SVGGElement, DraggableProps>(
	(
		{
			id,
			initialPoint,
			direction = DragDirection.All,
			cursor = "move",
			visible = true,
			tabIndex = 0,
			focusOutline = "1px dashed blue",
			onDragStart,
			onDrag,
			onDragEnd,
			onFocus,
			onBulr,
			children,
		},
		ref,
	) => {
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
			const x =
				direction === DragDirection.Vertical
					? point.x
					: e.clientX - startX.current;
			const y =
				direction === DragDirection.Horizontal
					? point.y
					: e.clientY - startY.current;

			return {
				x,
				y,
			};
		};

		const handlePointerDown = (e: React.PointerEvent<SVGElement>) => {
			setIsDragging(true);

			startX.current = e.clientX - point.x;
			startY.current = e.clientY - point.y;

			e.currentTarget.setPointerCapture(e.pointerId);

			onDragStart?.({
				point: getPoint(e),
				reactEvent: e,
			});
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

		const handleFocus = (e: React.FocusEvent<SVGGElement>) => {
			onFocus?.(e);
		};

		const handleBulr = (e: React.FocusEvent<SVGGElement>) => {
			onBulr?.(e);
		};

		const handleKeyDown = (e: React.KeyboardEvent<SVGGElement>) => {
			if (e.key === "ArrowRight") {
				if (direction === DragDirection.Vertical) {
					return;
				}

				setPoint((prevPoint) => {
					const point = {
						x: prevPoint.x + 1,
						y: prevPoint.y,
					};

					onDragStart?.({
						point: prevPoint,
					});
					onDrag?.({
						point,
					});

					return point;
				});
			}
			if (e.key === "ArrowLeft") {
				if (direction === DragDirection.Vertical) {
					return;
				}

				setPoint((prevPoint) => {
					const point = {
						x: prevPoint.x - 1,
						y: prevPoint.y,
					};

					onDragStart?.({
						point: prevPoint,
					});
					onDrag?.({
						point,
					});

					return point;
				});
			}
			if (e.key === "ArrowUp") {
				if (direction === DragDirection.Horizontal) {
					return;
				}

				setPoint((prevPoint) => {
					const point = {
						x: prevPoint.x,
						y: prevPoint.y - 1,
					};

					onDragStart?.({
						point: prevPoint,
					});
					onDrag?.({
						point,
					});

					return point;
				});
			}
			if (e.key === "ArrowDown") {
				if (direction === DragDirection.Horizontal) {
					return;
				}

				setPoint((prevPoint) => {
					const point = {
						x: prevPoint.x,
						y: prevPoint.y + 1,
					};

					onDragStart?.({
						point: prevPoint,
					});
					onDrag?.({
						point,
					});

					return point;
				});
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
				id={id}
				transform={`translate(${point.x}, ${point.y})`}
				onPointerDown={handlePointerDown}
				onPointerMove={handlePointerMove}
				onPointerUp={handlePointerUp}
				onFocus={handleFocus}
				onBlur={handleBulr}
				onKeyDown={handleKeyDown}
				onKeyUp={handleKeyUp}
				tabIndex={tabIndex}
				cursor={cursor}
				ref={domRef}
				visibility={visible ? "visible" : "hidden"}
				focusOutline={focusOutline}
			>
				{children}
			</DraggableG>
		);
	},
);

export default Draggable;
