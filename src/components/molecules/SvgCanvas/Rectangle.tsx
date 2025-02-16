import type React from "react";
import { useState, useRef, useCallback } from "react";
import type Point from "../../../types/Point";
import DragPoint from "./DragPoint";
import Draggable, { DragDirection } from "./Draggable";
import type { DragEvent } from "./Draggable";
import styled from "@emotion/styled";

const updatedPoints = (point: Point, diagonalPoint: Point) => {
	const top = Math.min(point.y, diagonalPoint.y);
	const bottom = Math.max(point.y, diagonalPoint.y);
	const left = Math.min(point.x, diagonalPoint.x);
	const right = Math.max(point.x, diagonalPoint.x);

	const leftTopPoint = {
		x: left,
		y: top,
	};

	const leftBottomPoint = {
		x: left,
		y: bottom,
	};

	const rightTopPoint = {
		x: right,
		y: top,
	};

	const rightBottomPoint = {
		x: right,
		y: bottom,
	};

	const witdh = right - left;
	const height = bottom - top;

	const topCenterPoint = {
		x: left + witdh / 2,
		y: top,
	};

	const leftCenterPoint = {
		x: left,
		y: top + height / 2,
	};

	const rightCenterPoint = {
		x: right,
		y: top + height / 2,
	};

	const bottomCenterPoint = {
		x: left + witdh / 2,
		y: bottom,
	};

	return {
		point: leftTopPoint,
		leftTopPoint,
		leftBottomPoint,
		rightTopPoint,
		rightBottomPoint,
		topCenterPoint,
		leftCenterPoint,
		rightCenterPoint,
		bottomCenterPoint,
		width: witdh,
		height: height,
	};
};

const ContainerG = styled.g`
    outline: none;
`;

type RectangleProps = {
	initialPoint: Point;
	initialWidth: number;
	initialHeight: number;
	fill?: string;
	stroke?: string;
	strokeWidth?: number;
	tabIndex?: number;
	children?: React.ReactNode;
};

const Rectangle: React.FC<RectangleProps> = ({
	initialPoint,
	initialWidth,
	initialHeight,
	fill = "transparent",
	stroke = "black",
	strokeWidth = 1,
	tabIndex = 0,
	children,
}) => {
	const [state, setState] = useState({
		point: initialPoint,
		width: initialWidth,
		height: initialHeight,
		leftTopPoint: initialPoint,
		leftBottomPoint: {
			x: initialPoint.x,
			y: initialPoint.y + initialHeight,
		},
		rightTopPoint: {
			x: initialPoint.x + initialWidth,
			y: initialPoint.y,
		},
		rightBottomPoint: {
			x: initialPoint.x + initialWidth,
			y: initialPoint.y + initialHeight,
		},
		topCenterPoint: {
			x: initialPoint.x + initialWidth / 2,
			y: initialPoint.y,
		},
		leftCenterPoint: {
			x: initialPoint.x,
			y: initialPoint.y + initialHeight / 2,
		},
		rightCenterPoint: {
			x: initialPoint.x + initialWidth,
			y: initialPoint.y + initialHeight / 2,
		},
		bottomCenterPoint: {
			x: initialPoint.x + initialWidth / 2,
			y: initialPoint.y + initialHeight,
		},
		isFocused: false,
		isDragging: false,
		isLeftTopDragging: false,
		isLeftBottomDragging: false,
		isRightTopDragging: false,
		isRightBottomDragging: false,
		isTopCenterDragging: false,
		isLeftCenterDragging: false,
		isRightCenterDragging: false,
		isBottomCenterDragging: false,
	});

	const draggableRef = useRef<SVGGElement | null>(null);
	const rectRef = useRef<SVGRectElement | null>(null);

	const onFocus = useCallback(() => {
		setState((prevState) => ({
			...prevState,
			isFocused: true,
		}));
	}, []);

	const onBlur = useCallback(() => {
		setState((prevState) => ({
			...prevState,
			isFocused: false,
		}));
	}, []);

	// -- 以下共通関数 --

	const updateDomPoints = useCallback(
		(leftTopPoint: Point, width: number, height: number) => {
			draggableRef.current?.setAttribute(
				"transform",
				`translate(${leftTopPoint.x}, ${leftTopPoint.y})`,
			);
			rectRef.current?.setAttribute("width", `${width}`);
			rectRef.current?.setAttribute("height", `${height}`);
		},
		[],
	);

	// --- 以下四角形全体のドラッグ ---

	const onDragStart = useCallback((_e: DragEvent) => {
		setState((prevState) => ({
			...prevState,
			isDragging: true,
		}));
	}, []);

	const onDragEnd = useCallback(
		(e: DragEvent) => {
			setState((prevState) => ({
				...prevState,
				point: e.point,
				leftTopPoint: e.point,
				leftBottomPoint: {
					x: e.point.x,
					y: e.point.y + state.height,
				},
				rightTopPoint: {
					x: e.point.x + state.width,
					y: e.point.y,
				},
				rightBottomPoint: {
					x: e.point.x + state.width,
					y: e.point.y + state.height,
				},
				topCenterPoint: {
					x: e.point.x + state.width / 2,
					y: e.point.y,
				},
				leftCenterPoint: {
					x: e.point.x,
					y: e.point.y + state.height / 2,
				},
				rightCenterPoint: {
					x: e.point.x + state.width,
					y: e.point.y + state.height / 2,
				},
				bottomCenterPoint: {
					x: e.point.x + state.width / 2,
					y: e.point.y + state.height,
				},
				isDragging: false,
			}));
		},
		[state.width, state.height],
	);

	// --- 以下左上の点のドラッグ ---

	const onLeftTopDragStart = useCallback((_e: DragEvent) => {
		setState((prevState) => ({
			...prevState,
			isDragging: true,
			isLeftTopDragging: true,
		}));
	}, []);

	const onLeftTopDrag = useCallback(
		(e: DragEvent) => {
			const { leftTopPoint, width, height } = updatedPoints(
				e.point,
				state.rightBottomPoint,
			);

			updateDomPoints(leftTopPoint, width, height);
		},
		[updateDomPoints, state.rightBottomPoint],
	);

	const onLeftTopDragEnd = useCallback(
		(e: DragEvent) => {
			const points = updatedPoints(e.point, state.rightBottomPoint);

			setState((prevState) => ({
				...prevState,
				...points,
				isDragging: false,
				isLeftTopDragging: false,
			}));
		},
		[state.rightBottomPoint],
	);

	// --- 以下左下の点のドラッグ ---

	const onLeftBottomDragStart = useCallback((_e: DragEvent) => {
		setState((prevState) => ({
			...prevState,
			isDragging: true,
			isLeftBottomDragging: true,
		}));
	}, []);

	const onLeftBottomDrag = useCallback(
		(e: DragEvent) => {
			const { leftTopPoint, width, height } = updatedPoints(
				e.point,
				state.rightTopPoint,
			);

			updateDomPoints(leftTopPoint, width, height);
		},
		[updateDomPoints, state.rightTopPoint],
	);

	const onLeftBottomDragEnd = useCallback(
		(e: DragEvent) => {
			const points = updatedPoints(e.point, state.rightTopPoint);

			setState((prevState) => ({
				...prevState,
				...points,
				isDragging: false,
				isLeftBottomDragging: false,
			}));
		},
		[state.rightTopPoint],
	);

	// --- 以下右上の点のドラッグ ---

	const onRightTopDragStart = useCallback((_e: DragEvent) => {
		setState((prevState) => ({
			...prevState,
			isDragging: true,
			isRightTopDragging: true,
		}));
	}, []);

	const onRightTopDrag = useCallback(
		(e: DragEvent) => {
			const { leftTopPoint, width, height } = updatedPoints(
				e.point,
				state.leftBottomPoint,
			);

			updateDomPoints(leftTopPoint, width, height);
		},
		[updateDomPoints, state.leftBottomPoint],
	);

	const onRightTopDragEnd = useCallback(
		(e: DragEvent) => {
			const points = updatedPoints(e.point, state.leftBottomPoint);

			setState((prevState) => ({
				...prevState,
				...points,
				isDragging: false,
				isRightTopDragging: false,
			}));
		},
		[state.leftBottomPoint],
	);

	// --- 以下右下の点のドラッグ ---

	const onRightBottomDragStart = useCallback((_e: DragEvent) => {
		setState((prevState) => ({
			...prevState,
			isDragging: true,
			isRightBottomDragging: true,
		}));
	}, []);

	const onRightBottomDrag = useCallback(
		(e: DragEvent) => {
			const { leftTopPoint, width, height } = updatedPoints(
				e.point,
				state.leftTopPoint,
			);

			updateDomPoints(leftTopPoint, width, height);
		},
		[updateDomPoints, state.leftTopPoint],
	);

	const onRightBottomDragEnd = useCallback(
		(e: DragEvent) => {
			const points = updatedPoints(e.point, state.leftTopPoint);

			setState((prevState) => ({
				...prevState,
				...points,
				isDragging: false,
				isRightBottomDragging: false,
			}));
		},
		[state.leftTopPoint],
	);

	// --- 以下上中央の点のドラッグ ---

	const onTopCenterDragStart = useCallback((_e: DragEvent) => {
		setState((prevState) => ({
			...prevState,
			isDragging: true,
			isTopCenterDragging: true,
		}));
	}, []);

	const onTopCenterDrag = useCallback(
		(e: DragEvent) => {
			const height = Math.abs(state.leftBottomPoint.y - e.point.y);

			const leftTopPoint = {
				x: state.leftBottomPoint.x,
				y: Math.min(e.point.y, state.leftBottomPoint.y),
			};

			updateDomPoints(leftTopPoint, state.width, height);
		},
		[updateDomPoints, state.leftBottomPoint, state.width],
	);

	const onTopCenterDragEnd = useCallback(
		(e: DragEvent) => {
			const leftTopPoint = {
				x: state.leftTopPoint.x,
				y: e.point.y,
			};
			const points = updatedPoints(leftTopPoint, state.rightBottomPoint);

			setState((prevState) => ({
				...prevState,
				...points,
				isDragging: false,
				isTopCenterDragging: false,
			}));
		},
		[state.rightBottomPoint, state.leftTopPoint.x],
	);

	// --- 以下左中央の点のドラッグ ---

	const onLeftCenterDragStart = useCallback((_e: DragEvent) => {
		setState((prevState) => ({
			...prevState,
			isDragging: true,
			isLeftCenterDragging: true,
		}));
	}, []);

	const onLeftCenterDrag = useCallback(
		(e: DragEvent) => {
			const width = Math.abs(state.rightBottomPoint.x - e.point.x);

			const leftTopPoint = {
				x: Math.min(e.point.x, state.rightBottomPoint.x),
				y: state.rightTopPoint.y,
			};

			updateDomPoints(leftTopPoint, width, state.height);
		},
		[
			updateDomPoints,
			state.rightBottomPoint.x,
			state.rightTopPoint.y,
			state.height,
		],
	);

	const onLeftCenterDragEnd = useCallback(
		(e: DragEvent) => {
			const leftTopPoint = {
				x: Math.min(e.point.x, state.rightBottomPoint.x),
				y: state.rightTopPoint.y,
			};
			const rightBottomPoint = {
				x: Math.max(e.point.x, state.rightBottomPoint.x),
				y: state.rightBottomPoint.y,
			};
			const points = updatedPoints(leftTopPoint, rightBottomPoint);

			setState((prevState) => ({
				...prevState,
				...points,
				isDragging: false,
				isLeftCenterDragging: false,
			}));
		},
		[state.rightTopPoint.y, state.rightBottomPoint],
	);

	// --- 以下右中央の点のドラッグ ---

	const onRightCenterDragStart = useCallback((_e: DragEvent) => {
		setState((prevState) => ({
			...prevState,
			isDragging: true,
			isRightCenterDragging: true,
		}));
	}, []);

	const onRightCenterDrag = useCallback(
		(e: DragEvent) => {
			const width = Math.abs(state.leftTopPoint.x - e.point.x);

			const leftTopPoint = {
				x: Math.min(e.point.x, state.leftTopPoint.x),
				y: state.leftTopPoint.y,
			};

			updateDomPoints(leftTopPoint, width, state.height);
		},
		[updateDomPoints, state.leftTopPoint, state.height],
	);

	const onRightCenterDragEnd = useCallback(
		(e: DragEvent) => {
			const leftTopPoint = {
				x: Math.min(e.point.x, state.leftTopPoint.x),
				y: state.leftTopPoint.y,
			};
			const rightBottomPoint = {
				x: Math.max(e.point.x, state.leftTopPoint.x),
				y: state.rightBottomPoint.y,
			};
			const points = updatedPoints(leftTopPoint, rightBottomPoint);

			setState((prevState) => ({
				...prevState,
				...points,
				isDragging: false,
				isRightCenterDragging: false,
			}));
		},
		[state.leftTopPoint, state.rightBottomPoint],
	);

	// --- 以下下中央の点のドラッグ ---

	const onBottomCenterDragStart = useCallback((_e: DragEvent) => {
		setState((prevState) => ({
			...prevState,
			isDragging: true,
			isBottomCenterDragging: true,
		}));
	}, []);

	const onBottomCenterDrag = useCallback(
		(e: DragEvent) => {
			const height = Math.abs(state.leftTopPoint.y - e.point.y);

			const leftTopPoint = {
				x: state.leftTopPoint.x,
				y: Math.min(e.point.y, state.leftTopPoint.y),
			};

			updateDomPoints(leftTopPoint, state.width, height);
		},
		[updateDomPoints, state.leftTopPoint, state.width],
	);

	const onBottomCenterDragEnd = useCallback(
		(e: DragEvent) => {
			const rightBottomPoint = {
				x: state.rightTopPoint.x,
				y: e.point.y,
			};
			const points = updatedPoints(rightBottomPoint, state.leftTopPoint);

			setState((prevState) => ({
				...prevState,
				...points,
				isDragging: false,
				isBottomCenterDragging: false,
			}));
		},
		[state.leftTopPoint, state.rightTopPoint.x],
	);

	/**
	 * キーボードイベントに基づいて矩形の位置を更新するハンドラ。
	 *
	 * @param {React.KeyboardEvent<SVGGElement>} e - キーボードイベント。
	 *
	 * @returns {void}
	 *
	 * @remarks
	 * 矩形の左上および右下のポイントを矢印キーに応じて1ピクセルずつ移動します。
	 * - "ArrowRight": 右に1ピクセル移動
	 * - "ArrowLeft": 左に1ピクセル移動
	 * - "ArrowUp": 上に1ピクセル移動
	 * - "ArrowDown": 下に1ピクセル移動
	 *
	 * ポイントが更新された場合、新しいポイントで状態を更新します。
	 */
	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent<SVGGElement>) => {
			let leftTopPoint: Point | undefined;
			let rightBottomPoint: Point | undefined;
			if (e.key === "ArrowRight") {
				leftTopPoint = {
					x: state.leftTopPoint.x + 1,
					y: state.leftTopPoint.y,
				};
				rightBottomPoint = {
					x: state.rightBottomPoint.x + 1,
					y: state.rightBottomPoint.y,
				};
			}
			if (e.key === "ArrowLeft") {
				leftTopPoint = {
					x: state.leftTopPoint.x - 1,
					y: state.leftTopPoint.y,
				};
				rightBottomPoint = {
					x: state.rightBottomPoint.x - 1,
					y: state.rightBottomPoint.y,
				};
			}
			if (e.key === "ArrowUp") {
				leftTopPoint = {
					x: state.leftTopPoint.x,
					y: state.leftTopPoint.y - 1,
				};
				rightBottomPoint = {
					x: state.rightBottomPoint.x,
					y: state.rightBottomPoint.y - 1,
				};
			}
			if (e.key === "ArrowDown") {
				leftTopPoint = {
					x: state.leftTopPoint.x,
					y: state.leftTopPoint.y + 1,
				};
				rightBottomPoint = {
					x: state.rightBottomPoint.x,
					y: state.rightBottomPoint.y + 1,
				};
			}
			if (leftTopPoint && rightBottomPoint) {
				const points = updatedPoints(leftTopPoint, rightBottomPoint);
				setState((prevState) => ({
					...prevState,
					...points,
				}));
			}
		},
		[state.leftTopPoint, state.rightBottomPoint],
	);

	return (
		<ContainerG
			onFocus={onFocus}
			onBlur={onBlur}
			onKeyDown={handleKeyDown}
			tabIndex={tabIndex}
		>
			<Draggable
				initialPoint={state.point}
				onDragStart={onDragStart}
				onDragEnd={onDragEnd}
				ref={draggableRef}
			>
				<rect
					x={0}
					y={0}
					width={state.width}
					height={state.height}
					fill={fill}
					stroke={stroke}
					strokeWidth={strokeWidth}
					ref={rectRef}
				/>
				{children}
			</Draggable>
			{state.isFocused && (
				<>
					{/* 左上 */}
					<DragPoint
						initialPoint={state.leftTopPoint}
						onDragStart={onLeftTopDragStart}
						onDrag={onLeftTopDrag}
						onDragEnd={onLeftTopDragEnd}
						cursor="nw-resize"
						hidden={state.isDragging && !state.isLeftTopDragging}
					/>
					{/* 左下 */}
					<DragPoint
						initialPoint={state.leftBottomPoint}
						onDragStart={onLeftBottomDragStart}
						onDrag={onLeftBottomDrag}
						onDragEnd={onLeftBottomDragEnd}
						cursor="sw-resize"
						hidden={state.isDragging && !state.isLeftBottomDragging}
					/>
					{/* 右上 */}
					<DragPoint
						initialPoint={state.rightTopPoint}
						onDragStart={onRightTopDragStart}
						onDrag={onRightTopDrag}
						onDragEnd={onRightTopDragEnd}
						cursor="ne-resize"
						hidden={state.isDragging && !state.isRightTopDragging}
					/>
					{/* 右下 */}
					<DragPoint
						initialPoint={state.rightBottomPoint}
						onDragStart={onRightBottomDragStart}
						onDrag={onRightBottomDrag}
						onDragEnd={onRightBottomDragEnd}
						cursor="se-resize"
						hidden={state.isDragging && !state.isRightBottomDragging}
					/>
					{/* 上中央 */}
					<DragPoint
						initialPoint={state.topCenterPoint}
						direction={DragDirection.Vertical}
						onDragStart={onTopCenterDragStart}
						onDrag={onTopCenterDrag}
						onDragEnd={onTopCenterDragEnd}
						cursor="n-resize"
						hidden={state.isDragging && !state.isTopCenterDragging}
					/>
					{/* 左中央 */}
					<DragPoint
						initialPoint={state.leftCenterPoint}
						direction={DragDirection.Horizontal}
						onDragStart={onLeftCenterDragStart}
						onDrag={onLeftCenterDrag}
						onDragEnd={onLeftCenterDragEnd}
						cursor="w-resize"
						hidden={state.isDragging && !state.isLeftCenterDragging}
					/>
					{/* 右中央 */}
					<DragPoint
						initialPoint={state.rightCenterPoint}
						direction={DragDirection.Horizontal}
						onDragStart={onRightCenterDragStart}
						onDrag={onRightCenterDrag}
						onDragEnd={onRightCenterDragEnd}
						cursor="e-resize"
						hidden={state.isDragging && !state.isRightCenterDragging}
					/>
					{/* 下中央 */}
					<DragPoint
						initialPoint={state.bottomCenterPoint}
						direction={DragDirection.Vertical}
						onDragStart={onBottomCenterDragStart}
						onDrag={onBottomCenterDrag}
						onDragEnd={onBottomCenterDragEnd}
						cursor="s-resize"
						hidden={state.isDragging && !state.isBottomCenterDragging}
					/>
				</>
			)}
		</ContainerG>
	);
};

export default Rectangle;
