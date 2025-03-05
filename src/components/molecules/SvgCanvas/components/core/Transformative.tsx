// Reactのインポート
import type React from "react";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { Point } from "../../types/CoordinateTypes";
import type { DiagramType } from "../../types/DiagramTypes";
import type { DiagramDragEvent } from "../../types/EventTypes";

import DragPoint from "./DragPoint";

import {
	calcRectangleVertices,
	createLinerDragX2yFunction,
	createLinerDragY2xFunction,
} from "./RectangleBase/RectangleBaseFunctions";

import {
	affineTransformation,
	calcNearestCircleIntersectionPoint,
	calculateAngle,
	degreesToRadians,
	inverseAffineTransformation,
	nanToZero,
	radiansToDegrees,
} from "../../functions/Math";
import { createSvgTransform } from "../../functions/Svg";

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
	isSelected: boolean;
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
	isSelected,
	onTransform,
}) => {
	const [isShiftKeyDown, setShiftKeyDown] = useState(false);

	const doKeepProportion = keepProportion || isShiftKeyDown;

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
			if (doKeepProportion && startBox.current.aspectRatio) {
				newHeight = nanToZero(newWidth / startBox.current.aspectRatio);
			} else {
				newHeight = inversedRightBottom.y - inversedDragPoint.y;
			}

			const inversedCenter = {
				x: inversedRightBottom.x - nanToZero(newWidth / 2),
				y: inversedRightBottom.y - nanToZero(newHeight / 2),
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

	const linerDragFunctionLeftTop = useCallback(
		(p: Point) =>
			createLinerDragY2xFunction(
				startBox.current.leftTopPoint,
				startBox.current.rightBottomPoint,
			)(p),
		[],
	);
	// --- LeftTop End --- //

	// --- LeftBottom Start --- //
	const handleDragLeftBottom = useCallback(
		(e: DiagramDragEvent) => {
			const inversedDragPoint = inverseAffineTransformationOnDrag(e.endPoint);
			const inversedRightTop = inverseAffineTransformationOnDrag(
				startBox.current.rightTopPoint,
			);

			const newWidth = inversedRightTop.x - inversedDragPoint.x;
			let newHeight: number;
			if (doKeepProportion && startBox.current.aspectRatio) {
				newHeight = nanToZero(newWidth / startBox.current.aspectRatio);
			} else {
				newHeight = inversedDragPoint.y - inversedRightTop.y;
			}

			const inversedCenter = {
				x: inversedRightTop.x - nanToZero(newWidth / 2),
				y: inversedRightTop.y + nanToZero(newHeight / 2),
			};
			const center = affineTransformationOnDrag(inversedCenter);

			triggerTransform(center, newWidth, newHeight);
		},
		[
			triggerTransform,
			affineTransformationOnDrag,
			inverseAffineTransformationOnDrag,
			doKeepProportion,
		],
	);

	const linerDragFunctionLeftBottom = useCallback(
		(p: Point) =>
			createLinerDragY2xFunction(
				startBox.current.rightTopPoint,
				startBox.current.leftBottomPoint,
			)(p),
		[],
	);
	// --- LeftTop Bottom --- //

	// --- RightTop Start --- //
	const handleDragRightTop = useCallback(
		(e: DiagramDragEvent) => {
			const inversedDragPoint = inverseAffineTransformationOnDrag(e.endPoint);
			const inversedLeftBottom = inverseAffineTransformationOnDrag(
				startBox.current.leftBottomPoint,
			);

			const newWidth = inversedDragPoint.x - inversedLeftBottom.x;
			let newHeight: number;
			if (doKeepProportion && startBox.current.aspectRatio) {
				newHeight = nanToZero(newWidth / startBox.current.aspectRatio);
			} else {
				newHeight = inversedLeftBottom.y - inversedDragPoint.y;
			}

			const inversedCenter = {
				x: inversedLeftBottom.x + nanToZero(newWidth / 2),
				y: inversedLeftBottom.y - nanToZero(newHeight / 2),
			};
			const center = affineTransformationOnDrag(inversedCenter);

			triggerTransform(center, newWidth, newHeight);
		},
		[
			triggerTransform,
			affineTransformationOnDrag,
			inverseAffineTransformationOnDrag,
			doKeepProportion,
		],
	);

	const linerDragFunctionRightTop = useCallback(
		(p: Point) =>
			createLinerDragY2xFunction(
				startBox.current.rightTopPoint,
				startBox.current.leftBottomPoint,
			)(p),
		[],
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
			if (doKeepProportion && startBox.current.aspectRatio) {
				newHeight = nanToZero(newWidth / startBox.current.aspectRatio);
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
			doKeepProportion,
		],
	);

	const linerDragFunctionRightBottom = useCallback(
		(p: Point) =>
			createLinerDragY2xFunction(
				startBox.current.rightBottomPoint,
				startBox.current.leftTopPoint,
			)(p),
		[],
	);
	// --- RightBottom End --- //

	// --- TopCenter Start --- //
	const handleDragTopCenter = useCallback(
		(e: DiagramDragEvent) => {
			const inversedDragPoint = inverseAffineTransformationOnDrag(e.endPoint);
			const inversedBottomCenter = inverseAffineTransformationOnDrag(
				startBox.current.bottomCenterPoint,
			);

			let newWidth: number;
			const newHeight = inversedBottomCenter.y - inversedDragPoint.y;
			if (doKeepProportion && startBox.current.aspectRatio) {
				newWidth = nanToZero(newHeight * startBox.current.aspectRatio);
			} else {
				newWidth = startBox.current.width;
			}

			const inversedCenter = {
				x: inversedBottomCenter.x,
				y: inversedBottomCenter.y - (newHeight === 0 ? 0 : newHeight / 2),
			};
			const center = affineTransformationOnDrag(inversedCenter);

			triggerTransform(center, newWidth, newHeight);
		},
		[
			triggerTransform,
			affineTransformationOnDrag,
			inverseAffineTransformationOnDrag,
			doKeepProportion,
		],
	);

	const linerDragFunctionTopCenter = useCallback(
		(p: Point) =>
			createLinerDragY2xFunction(
				startBox.current.bottomCenterPoint,
				startBox.current.topCenterPoint,
			)(p),
		[],
	);
	// --- TopCenter End --- //

	// --- LeftCenter Start --- //
	const handleDragLeftCenter = useCallback(
		(e: DiagramDragEvent) => {
			const inversedDragPoint = inverseAffineTransformationOnDrag(e.endPoint);
			const inversedRightCenter = inverseAffineTransformationOnDrag(
				startBox.current.rightCenterPoint,
			);

			const newWidth = inversedRightCenter.x - inversedDragPoint.x;
			let newHeight: number;
			if (doKeepProportion && startBox.current.aspectRatio) {
				newHeight = nanToZero(newWidth / startBox.current.aspectRatio);
			} else {
				newHeight = startBox.current.height;
			}

			const inversedCenter = {
				x: inversedRightCenter.x - (newWidth === 0 ? 0 : newWidth / 2),
				y: inversedRightCenter.y,
			};
			const center = affineTransformationOnDrag(inversedCenter);

			triggerTransform(center, newWidth, newHeight);
		},
		[
			triggerTransform,
			affineTransformationOnDrag,
			inverseAffineTransformationOnDrag,
			doKeepProportion,
		],
	);

	const linerDragFunctionLeftCenter = useCallback(
		(p: Point) =>
			createLinerDragX2yFunction(
				startBox.current.leftCenterPoint,
				startBox.current.rightCenterPoint,
			)(p),
		[],
	);
	// --- LeftCenter End --- //

	// --- RightCenter Start --- //
	const handleDragRightCenter = useCallback(
		(e: DiagramDragEvent) => {
			const inversedDragPoint = inverseAffineTransformationOnDrag(e.endPoint);
			const inversedLeftCenter = inverseAffineTransformationOnDrag(
				startBox.current.leftCenterPoint,
			);

			const newWidth = inversedDragPoint.x - inversedLeftCenter.x;
			let newHeight: number;
			if (doKeepProportion && startBox.current.aspectRatio) {
				newHeight = nanToZero(newWidth / startBox.current.aspectRatio);
			} else {
				newHeight = startBox.current.height;
			}

			const inversedCenter = {
				x: inversedLeftCenter.x + (newWidth === 0 ? 0 : newWidth / 2),
				y: inversedLeftCenter.y,
			};
			const center = affineTransformationOnDrag(inversedCenter);

			triggerTransform(center, newWidth, newHeight);
		},
		[
			triggerTransform,
			affineTransformationOnDrag,
			inverseAffineTransformationOnDrag,
			doKeepProportion,
		],
	);

	const linerDragFunctionRightCenter = useCallback(
		(p: Point) =>
			createLinerDragX2yFunction(
				startBox.current.leftCenterPoint,
				startBox.current.rightCenterPoint,
			)(p),
		[],
	);
	// --- RightCenter End --- //

	// --- BottomCenter Start --- //
	const handleDragBottomCenter = useCallback(
		(e: DiagramDragEvent) => {
			const inversedDragPoint = inverseAffineTransformationOnDrag(e.endPoint);
			const inversedTopCenter = inverseAffineTransformationOnDrag(
				startBox.current.topCenterPoint,
			);

			let newWidth: number;
			const newHeight = inversedDragPoint.y - inversedTopCenter.y;
			if (doKeepProportion && startBox.current.aspectRatio) {
				newWidth = nanToZero(newHeight * startBox.current.aspectRatio);
			} else {
				newWidth = startBox.current.width;
			}

			const inversedCenter = {
				x: inversedTopCenter.x,
				y: inversedTopCenter.y + (newHeight === 0 ? 0 : newHeight / 2),
			};
			const center = affineTransformationOnDrag(inversedCenter);

			triggerTransform(center, newWidth, newHeight);
		},
		[
			triggerTransform,
			affineTransformationOnDrag,
			inverseAffineTransformationOnDrag,
			doKeepProportion,
		],
	);

	const linerDragFunctionBottomCenter = useCallback(
		(p: Point) =>
			createLinerDragY2xFunction(
				startBox.current.bottomCenterPoint,
				startBox.current.topCenterPoint,
			)(p),
		[],
	);
	// --- BottomCenter End --- //

	// シフトキーの状態を監視
	useEffect(() => {
		let handleKeyDown: (e: KeyboardEvent) => void;
		let handleKeyUp: (e: KeyboardEvent) => void;
		if (isSelected) {
			handleKeyDown = (e: KeyboardEvent) => {
				setShiftKeyDown(e.shiftKey);
			};
			handleKeyUp = (e: KeyboardEvent) => {
				if (e.key === "Shift") {
					setShiftKeyDown(false);
				}
			};

			window.addEventListener("keydown", handleKeyDown);
			window.addEventListener("keyup", handleKeyUp);
		}

		return () => {
			// クリーンアップ
			if (isSelected) {
				window.removeEventListener("keydown", handleKeyDown);
				window.removeEventListener("keyup", handleKeyUp);
			}
		};
	}, [isSelected]);

	// 回転
	const rp = affineTransformation(
		{ x: width / 2 + 20, y: 0 },
		1,
		1,
		degreesToRadians(rotation),
		point.x,
		point.y,
	);

	if (!isSelected) {
		return null;
	}

	return (
		<>
			{/* アウトライン */}
			<rect
				x={-width / 2}
				y={-height / 2}
				width={width}
				height={height}
				fill="transparent"
				stroke="blue"
				strokeWidth="1px"
				strokeDasharray="3,3"
				pointerEvents={"none"}
				transform={createSvgTransform(
					scaleX,
					scaleY,
					radians,
					point.x,
					point.y,
				)}
			/>
			{/* 左上 */}
			<DragPoint
				id={`${id}-leftTop`}
				point={vertices.leftTopPoint}
				onDragStart={handleDragStart}
				onDrag={handleDragLeftTop}
				dragPositioningFunction={
					doKeepProportion ? linerDragFunctionLeftTop : undefined
				}
			/>
			{/* 左下 */}
			<DragPoint
				id={`${id}-leftBottom`}
				point={vertices.leftBottomPoint}
				onDragStart={handleDragStart}
				onDrag={handleDragLeftBottom}
				dragPositioningFunction={
					doKeepProportion ? linerDragFunctionLeftBottom : undefined
				}
			/>
			{/* 右上 */}
			<DragPoint
				id={`${id}-rightTop`}
				point={vertices.rightTopPoint}
				onDragStart={handleDragStart}
				onDrag={handleDragRightTop}
				dragPositioningFunction={
					doKeepProportion ? linerDragFunctionRightTop : undefined
				}
			/>
			{/* 右下 */}
			<DragPoint
				id={`${id}-rightBottom`}
				point={vertices.rightBottomPoint}
				onDragStart={handleDragStart}
				onDrag={handleDragRightBottom}
				dragPositioningFunction={
					doKeepProportion ? linerDragFunctionRightBottom : undefined
				}
			/>
			{/* 上中央 */}
			<DragPoint
				id={`${id}-topCenter`}
				point={vertices.topCenterPoint}
				onDragStart={handleDragStart}
				onDrag={handleDragTopCenter}
				dragPositioningFunction={linerDragFunctionTopCenter}
			/>
			{/* 左中央 */}
			<DragPoint
				id={`${id}-leftCenter`}
				point={vertices.leftCenterPoint}
				onDragStart={handleDragStart}
				onDrag={handleDragLeftCenter}
				dragPositioningFunction={linerDragFunctionLeftCenter}
			/>
			{/* 右中央 */}
			<DragPoint
				id={`${id}-rightCenter`}
				point={vertices.rightCenterPoint}
				onDragStart={handleDragStart}
				onDrag={handleDragRightCenter}
				dragPositioningFunction={linerDragFunctionRightCenter}
			/>
			{/* 下中央 */}
			<DragPoint
				id={`${id}-bottomCenter`}
				point={vertices.bottomCenterPoint}
				onDragStart={handleDragStart}
				onDrag={handleDragBottomCenter}
				dragPositioningFunction={linerDragFunctionBottomCenter}
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
