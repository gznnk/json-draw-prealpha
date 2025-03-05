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
		...calcRectangleVertices(point, width, height, rotation, scaleX, scaleY),
	});

	const vertices = calcRectangleVertices(
		point,
		width,
		height,
		rotation,
		scaleX,
		scaleY,
	);

	const radians = useMemo(() => degreesToRadians(rotation), [rotation]);

	const affineTransformationOnDrag = useCallback(
		(p: Point) =>
			affineTransformation(
				p,
				1,
				1,
				radians,
				startBox.current.point.x,
				startBox.current.point.y,
			),
		[radians],
	);

	const inverseAffineTransformationOnDrag = useCallback(
		(p: Point) =>
			inverseAffineTransformation(
				p,
				1,
				1,
				radians,
				startBox.current.point.x,
				startBox.current.point.y,
			),
		[radians],
	);

	const triggerTransform = useCallback(
		(centerPoint: Point, newWidth: number, newHeight: number) => {
			onTransform({
				point: centerPoint,
				width: Math.abs(newWidth),
				height: Math.abs(newHeight),
				scaleX: newWidth > 0 ? 1 : -1,
				scaleY: newHeight > 0 ? 1 : -1,
				rotation,
			});
		},
		[onTransform, rotation],
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
			...vertices,
		};
	}, [point, width, height, rotation, scaleX, scaleY, vertices]);

	// --- LeftTop Start --- //
	const handleDragLeftTop = useCallback(
		(e: DiagramDragEvent) => {
			const inversedDragPoint = inverseAffineTransformationOnDrag(e.endPoint);
			const inversedRightBottom = inverseAffineTransformationOnDrag(
				startBox.current.rightBottomPoint,
			);

			const newWidth = inversedRightBottom.x - inversedDragPoint.x;
			let newHeight: number;
			if (keepProportion && startBox.current.aspectRatio) {
				newHeight =
					newWidth === 0 ? 0 : newWidth / startBox.current.aspectRatio;
			} else {
				newHeight = inversedRightBottom.y - inversedDragPoint.y;
			}

			const inversedCenter = {
				x: inversedRightBottom.x - (newWidth === 0 ? 0 : newWidth / 2),
				y: inversedRightBottom.y - (newHeight === 0 ? 0 : newHeight / 2),
			};
			const center = affineTransformationOnDrag(inversedCenter);

			triggerTransform(center, newWidth, newHeight);
		},
		[
			triggerTransform,
			affineTransformationOnDrag,
			inverseAffineTransformationOnDrag,
			keepProportion,
		],
	);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	const linerDragFunctionLeftTop = useCallback(
		(p: Point) =>
			createLinerDragY2xFunction(
				startBox.current.leftTopPoint,
				startBox.current.rightBottomPoint,
			)(p),
		[startBox.current.leftTopPoint, startBox.current.rightBottomPoint],
	);
	// --- LeftTop End --- //

	// --- RightTop Start --- //
	const handleDragRightTop = useCallback(
		(e: DiagramDragEvent) => {
			const inversedDragPoint = inverseAffineTransformationOnDrag(e.endPoint);
			const inversedLeftBottom = inverseAffineTransformationOnDrag(
				startBox.current.leftBottomPoint,
			);

			const newWidth = inversedDragPoint.x - inversedLeftBottom.x;
			let newHeight: number;
			if (keepProportion && startBox.current.aspectRatio) {
				newHeight =
					newWidth === 0 ? 0 : newWidth / startBox.current.aspectRatio;
			} else {
				newHeight = inversedLeftBottom.y - inversedDragPoint.y;
			}

			const inversedCenter = {
				x: inversedLeftBottom.x + (newWidth === 0 ? 0 : newWidth / 2),
				y: inversedLeftBottom.y - (newHeight === 0 ? 0 : newHeight / 2),
			};
			const center = affineTransformationOnDrag(inversedCenter);

			triggerTransform(center, newWidth, newHeight);
		},
		[
			triggerTransform,
			affineTransformationOnDrag,
			inverseAffineTransformationOnDrag,
			keepProportion,
		],
	);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	const linerDragFunctionRightTop = useCallback(
		(p: Point) =>
			createLinerDragY2xFunction(
				startBox.current.rightTopPoint,
				startBox.current.leftBottomPoint,
			)(p),
		[startBox.current.rightTopPoint, startBox.current.leftBottomPoint],
	);
	// --- RightTop End --- //

	// --- RightBottom Start --- //
	const handleDragRightBottom = useCallback(
		(e: DiagramDragEvent) => {
			const inversedDragPoint = inverseAffineTransformationOnDrag(e.endPoint);
			const inversedLeftTop = inverseAffineTransformationOnDrag(
				startBox.current.leftTopPoint,
			);

			const newWidth = inversedDragPoint.x - inversedLeftTop.x;
			let newHeight: number;
			if (keepProportion && startBox.current.aspectRatio) {
				newHeight =
					newWidth === 0 ? 0 : newWidth / startBox.current.aspectRatio;
			} else {
				newHeight = inversedDragPoint.y - inversedLeftTop.y;
			}

			const inversedCenter = {
				x: inversedLeftTop.x + (newWidth === 0 ? 0 : newWidth / 2),
				y: inversedLeftTop.y + (newHeight === 0 ? 0 : newHeight / 2),
			};
			const center = affineTransformationOnDrag(inversedCenter);

			triggerTransform(center, newWidth, newHeight);
		},
		[
			triggerTransform,
			affineTransformationOnDrag,
			inverseAffineTransformationOnDrag,
			keepProportion,
		],
	);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	const linerDragFunctionRightBottom = useCallback(
		(p: Point) =>
			createLinerDragY2xFunction(
				startBox.current.rightBottomPoint,
				startBox.current.leftTopPoint,
			)(p),
		[startBox.current.rightBottomPoint, startBox.current.leftTopPoint],
	);
	// --- RightBottom End --- //

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
				point={vertices.leftTopPoint}
				onDragStart={handleDragStart}
				onDrag={handleDragLeftTop}
				dragPositioningFunction={
					keepProportion ? linerDragFunctionLeftTop : undefined
				}
			/>
			<DragPoint
				id={`${id}-rightTop`}
				point={vertices.rightTopPoint}
				onDragStart={handleDragStart}
				onDrag={handleDragRightTop}
				dragPositioningFunction={
					keepProportion ? linerDragFunctionRightTop : undefined
				}
			/>
			<DragPoint
				id={`${id}-rightBottom`}
				point={vertices.rightBottomPoint}
				onDragStart={handleDragStart}
				onDrag={handleDragRightBottom}
				dragPositioningFunction={
					keepProportion ? linerDragFunctionRightBottom : undefined
				}
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
