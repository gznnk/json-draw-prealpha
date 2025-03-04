// Reactのインポート
import type React from "react";
import {
	forwardRef,
	memo,
	useCallback,
	useEffect,
	useImperativeHandle,
	useMemo,
	useRef,
	useState,
} from "react";

import type {
	DiagramClickEvent,
	DiagramConnectEvent,
	DiagramDragDropEvent,
	DiagramDragEvent,
	DiagramHoverEvent,
	DiagramResizeEvent,
	DiagramRotateEvent,
	DiagramSelectEvent,
	GroupDragEvent,
	GroupResizeEvent,
	ConnectPointMoveEvent,
} from "../../../types/EventTypes";
import type { DragDirection, Point } from "../../../types/CoordinateTypes";
import type { DiagramType } from "../../../types/DiagramTypes";

import DragPoint from "../DragPoint";

import {
	calcRectangleVertices,
	createLinerDragY2xFunction,
	createLinerDragX2yFunction,
} from "../RectangleBase/RectangleBaseFunctions";
import {
	degreesToRadians,
	rotatePoint,
	affineTransformation,
	calculateAngle,
	radiansToDegrees,
	calcNearestCircleIntersectionPoint,
	inverseAffineTransformation,
} from "../../../functions/Math";

type TransformEvent = {
	point: Point;
	width: number;
	height: number;
	rotation: number;
	scaleX: number;
	scaleY: number;
};

type TransformativeProps = {
	id: string;
	type: DiagramType;
	point: Point;
	width: number;
	height: number;
	rotation: number;
	scaleX: number;
	scaleY: number;
	keepProportion: boolean;
	// isSelected: boolean;
	onDiagramClick?: (e: DiagramClickEvent) => void;
	onDiagramDrop?: (e: DiagramDragDropEvent) => void;
	onDiagramResizeStart?: (e: DiagramResizeEvent) => void;
	onDiagramResizing?: (e: DiagramResizeEvent) => void;
	onDiagramResizeEnd?: (e: DiagramResizeEvent) => void;
	onDiagramRotating?: (e: DiagramRotateEvent) => void;
	onDiagramRotateEnd?: (e: DiagramRotateEvent) => void;
	onDiagramSelect?: (e: DiagramSelectEvent) => void;
	onDiagramHoverChange?: (e: DiagramHoverEvent) => void;
	onDiagramConnect?: (e: DiagramConnectEvent) => void;
	onConnectPointMove?: (e: ConnectPointMoveEvent) => void;
	onTransform: (e: TransformEvent) => void;
};

const Transformative: React.FC<TransformativeProps> = ({
	id,
	point,
	width,
	height,
	rotation,
	scaleX,
	scaleY,
	keepProportion,
	onTransform,
}) => {
	const startBox = useRef({
		point,
		width,
		height,
		rotation,
		scaleX,
		scaleY,
		aspectRatio: width / height,
	});

	const vertices = calcRectangleVertices(
		point,
		width,
		height,
		rotation,
		scaleX,
		scaleY,
	);

	const calcBoxFunction = useCallback(
		(e: DiagramDragEvent) => {
			const radians = degreesToRadians(startBox.current.rotation);

			const inverseAffine = (p: Point) =>
				inverseAffineTransformation(
					p,
					startBox.current.scaleX,
					startBox.current.scaleY,
					radians,
					startBox.current.point.x,
					startBox.current.point.y,
				);

			// 各座標を逆アフィン変換
			const inversedDragPoint = inverseAffine(e.endPoint);
			const inversedRightBottom = inverseAffine(vertices.rightBottomPoint);

			const newWidth = inversedRightBottom.x - inversedDragPoint.x;
			let newHeight: number;
			if (keepProportion && startBox.current.aspectRatio) {
				newHeight = newWidth / startBox.current.aspectRatio;
			} else {
				newHeight = inversedRightBottom.y - inversedDragPoint.y;
			}

			// const center = {
			// 	x:
			// 		startBox.current.point.x -
			// 		Math.abs(Math.abs(newWidth) - startBox.current.width) / 2,
			// 	y:
			// 		startBox.current.point.y -
			// 		Math.abs(Math.abs(newHeight) - startBox.current.height) / 2,
			// };

			const center = startBox.current.point;

			return {
				point: center,
				width: Math.abs(newWidth),
				height: Math.abs(newHeight),
				scaleX: newWidth > 0 ? 1 : -1,
				scaleY: newHeight > 0 ? 1 : -1,
			};
		},
		[vertices.rightBottomPoint, keepProportion],
	);

	const linerDragFunction = useCallback(
		(p: Point) =>
			createLinerDragY2xFunction(
				vertices.leftTopPoint,
				vertices.rightBottomPoint,
			)(p),
		[vertices.leftTopPoint, vertices.rightBottomPoint],
	);

	const handleDragStart = useCallback(() => {
		startBox.current = {
			point,
			width,
			height,
			rotation,
			scaleX,
			scaleY,
			aspectRatio: width / height,
		};
	}, [point, width, height, rotation, scaleX, scaleY]);

	const dragPointProps = {
		...vertices,
		point,
		width,
		height,
		rotation,
		scaleX,
		scaleY,
		onDragStart: handleDragStart,
	};

	const rp = affineTransformation(
		{ x: width / 2 + 20, y: 0 },
		1,
		1,
		degreesToRadians(rotation),
		point.x,
		point.y,
	);

	return (
		<>
			<DragPoint
				id={`${id}-leftTop`}
				point={dragPointProps.leftTopPoint}
				onDragStart={handleDragStart}
				onDrag={(e) => {
					const box = calcBoxFunction(e);
					onTransform({
						...box,
						rotation,
					});
				}}
				onDragEnd={(e) => {
					// const box = calcBoxFunction(e);
					// onTransform({
					// 	...box,
					// 	rotation,
					// });
				}}
				dragPositioningFunction={keepProportion ? linerDragFunction : undefined}
			/>
			<DragPoint
				id={`${id}-rightbottom`}
				point={dragPointProps.rightBottomPoint}
			/>
			{/* 回転 */}
			<DragPoint
				id={`rotation-${id}`}
				point={rp}
				onDrag={(e) => {
					const angle = calculateAngle(point, e.endPoint);
					console.log(radiansToDegrees(angle));
					onTransform({
						point,
						width,
						height,
						scaleX,
						scaleY,
						rotation: radiansToDegrees(angle),
					});
				}}
				onDragEnd={(e) => {
					const angle = calculateAngle(point, e.endPoint);
					onTransform({
						point,
						width,
						height,
						scaleX,
						scaleY,
						rotation: radiansToDegrees(angle),
					});
				}}
				dragPositioningFunction={(p: Point) => {
					return calcNearestCircleIntersectionPoint(
						{ x: point.x, y: point.y },
						width / 2 + 20,
						p,
					);
				}}
			/>
		</>
	);
};

export default memo(Transformative);
