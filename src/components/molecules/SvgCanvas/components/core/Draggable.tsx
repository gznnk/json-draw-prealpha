import type React from "react";
import {
	useEffect,
	useState,
	useRef,
	useCallback,
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
	point: Point;
	direction?: DragDirection;
	allowXDecimal?: boolean;
	allowYDecimal?: boolean;
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
	dragPositioningFunction?: (point: Point) => Point;
	children?: React.ReactNode;
};

const Draggable = forwardRef<SVGGElement, DraggableProps>(
	(
		{
			key,
			id,
			point,
			direction = DragDirection.All,
			allowXDecimal = false,
			allowYDecimal = false,
			cursor = "move",
			visible = true,
			tabIndex = 0,
			outline = "none",
			outlineOffset = "0px",
			onPointerDown,
			onDragStart,
			onDrag,
			onDragEnd,
			dragPositioningFunction,
			children,
		},
		ref,
	) => {
		const [state, setState] = useState({ point });
		const [isDragging, setIsDragging] = useState(false);

		const startX = useRef(0);
		const startY = useRef(0);

		const domRef = useRef<SVGGElement>({} as SVGGElement);

		useImperativeHandle(ref, () => domRef.current);

		useEffect(() => {
			setState({ point });
		}, [point]);

		const adjustCoordinates = useCallback(
			(p: Point) => {
				let x = p.x;
				let y = p.y;

				if (!allowXDecimal) {
					x = Math.round(x);
				}

				if (!allowYDecimal) {
					y = Math.round(y);
				}

				return {
					x,
					y,
				};
			},
			[allowXDecimal, allowYDecimal],
		);

		const getPoint = (e: React.PointerEvent<SVGElement>) => {
			let x = e.clientX - startX.current;
			let y = e.clientY - startY.current;

			if (direction === DragDirection.Horizontal) {
				y = state.point.y;
			} else if (direction === DragDirection.Vertical) {
				x = state.point.x;
			} else if (dragPositioningFunction) {
				const p = dragPositioningFunction({
					x,
					y,
				});
				x = p.x;
				y = p.y;
			}

			return adjustCoordinates({
				x,
				y,
			});
		};

		const handlePointerDown = (e: React.PointerEvent<SVGElement>) => {
			setIsDragging(true);

			startX.current = e.clientX - state.point.x;
			startY.current = e.clientY - state.point.y;

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

			const newPoint = getPoint(e);
			setState({
				point: newPoint,
			});

			setIsDragging(false);

			onDragEnd?.({
				point: newPoint,
				reactEvent: e,
			});
		};

		const handleKeyDown = (e: React.KeyboardEvent<SVGGElement>) => {
			const movePoint = (dx: number, dy: number) => {
				let newPoint = {
					x: state.point.x + dx,
					y: state.point.y + dy,
				};

				if (direction === DragDirection.Horizontal) {
					newPoint.y = state.point.y;
				} else if (direction === DragDirection.Vertical) {
					newPoint.x = state.point.x;
				} else if (dragPositioningFunction) {
					newPoint = dragPositioningFunction({ ...newPoint });
				}

				newPoint = adjustCoordinates(newPoint);

				onDragStart?.({ point: state.point });
				onDrag?.({
					point: newPoint,
				});
				setState({
					point: newPoint,
				});
			};

			switch (e.key) {
				case "ArrowRight":
					movePoint(1, 0);
					break;
				case "ArrowLeft":
					movePoint(-1, 0);
					break;
				case "ArrowUp":
					movePoint(0, -1);
					break;
				case "ArrowDown":
					movePoint(0, 1);
					break;
				default:
					break;
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
					point: state.point,
				});
			}
		};

		return (
			<DraggableG
				key={key}
				id={id}
				transform={`translate(${state.point.x}, ${state.point.y})`}
				tabIndex={tabIndex}
				cursor={cursor}
				visibility={visible ? "visible" : "hidden"}
				outline={outline}
				outlineOffset={outlineOffset}
				onPointerDown={handlePointerDown}
				onPointerMove={handlePointerMove}
				onPointerUp={handlePointerUp}
				onKeyDown={handleKeyDown}
				onKeyUp={handleKeyUp}
				ref={domRef}
			>
				{children}
			</DraggableG>
		);
	},
);

export default Draggable;
