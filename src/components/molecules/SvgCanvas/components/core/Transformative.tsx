// Reactのインポート
import type React from "react";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";

// SvgCanvas関連型定義をインポート
import type { Point } from "../../types/CoordinateTypes";
import type { DiagramType } from "../../types/DiagramTypes";
import type {
	DiagramDragEvent,
	DiagramTransformEvent,
	DiagramTransformStartEvent,
} from "../../types/EventTypes";

// SvgCanvas関連コンポーネントをインポート
import DragLine from "./DragLine";
import DragPoint from "./DragPoint";
import RotatePoint from "./RotatePoint";

// SvgCanvas関連関数をインポート
import {
	createSvgTransform,
	getCursorFromAngle,
} from "../../functions/Diagram";
import {
	affineTransformation,
	calcNearestCircleIntersectionPoint,
	calcRectangleVertices,
	calculateAngle,
	createLinerX2yFunction,
	createLinerY2xFunction,
	degreesToRadians,
	inverseAffineTransformation,
	nanToZero,
	radiansToDegrees,
} from "../../functions/Math";

/**
 * 変形コンポーネントのプロパティ
 */
type TransformativeProps = {
	diagramId: string;
	type: DiagramType;
	point: Point;
	width: number;
	height: number;
	rotation: number;
	scaleX: number;
	scaleY: number;
	keepProportion: boolean;
	isSelected: boolean;
	onTransformStart?: (e: DiagramTransformStartEvent) => void;
	onTransform?: (e: DiagramTransformEvent) => void;
	onTransformEnd?: (e: DiagramTransformEvent) => void;
};

/**
 * 変形コンポーネント
 */
const Transformative: React.FC<TransformativeProps> = ({
	diagramId,
	point,
	width,
	height,
	rotation,
	scaleX,
	scaleY,
	keepProportion,
	isSelected,
	onTransformStart,
	onTransform,
	onTransformEnd,
}) => {
	const [isShiftKeyDown, setShiftKeyDown] = useState(false);

	const doKeepProportion = keepProportion || isShiftKeyDown;

	const startShape = useRef({
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
	const isSwapped = useMemo(() => {
		return (rotation + 405) % 180 > 90;
	}, [rotation]);

	const affineTransformationOnDrag = useCallback(
		(p: Point) =>
			affineTransformation(
				p,
				1,
				1,
				radians,
				startShape.current.point.x,
				startShape.current.point.y,
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
				startShape.current.point.x,
				startShape.current.point.y,
			),
		[radians],
	);

	const triggerTransform = useCallback(
		(
			centerPoint: Point,
			newWidth: number,
			newHeight: number,
			dragEventType: "dragStart" | "drag" | "dragEnd",
		) => {
			const event = {
				id: diagramId,
				startShape: {
					...startShape.current,
				},
				endShape: {
					point: centerPoint,
					width: Math.abs(newWidth),
					height: Math.abs(newHeight),
					scaleX: newWidth > 0 ? 1 : -1,
					scaleY: newHeight > 0 ? 1 : -1,
					rotation,
				},
			};

			if (dragEventType === "dragEnd") {
				onTransformEnd?.(event);
			} else if (dragEventType === "drag") {
				onTransform?.(event);
			}
		},
		[onTransform, onTransformEnd, diagramId, rotation],
	);

	const handleDragStart = useCallback(() => {
		onTransformStart?.({
			id: diagramId,
		});
		startShape.current = {
			point,
			width,
			height,
			rotation,
			scaleX,
			scaleY,
			aspectRatio: width / height,
			...vertices,
		};
	}, [
		onTransformStart,
		diagramId,
		point,
		width,
		height,
		rotation,
		scaleX,
		scaleY,
		vertices,
	]);

	// --- LeftTop Start --- //
	const handleDragLeftTop = useCallback(
		(e: DiagramDragEvent) => {
			const inversedDragPoint = inverseAffineTransformationOnDrag(e.endPoint);
			const inversedRightBottom = inverseAffineTransformationOnDrag(
				startShape.current.rightBottomPoint,
			);

			const newWidth = inversedRightBottom.x - inversedDragPoint.x;
			let newHeight: number;
			if (doKeepProportion && startShape.current.aspectRatio) {
				newHeight =
					nanToZero(newWidth / startShape.current.aspectRatio) *
					startShape.current.scaleX *
					startShape.current.scaleY;
			} else {
				newHeight = inversedRightBottom.y - inversedDragPoint.y;
			}

			const inversedCenter = {
				x: inversedRightBottom.x - nanToZero(newWidth / 2),
				y: inversedRightBottom.y - nanToZero(newHeight / 2),
			};
			const center = affineTransformationOnDrag(inversedCenter);

			triggerTransform(center, newWidth, newHeight, e.type);
		},
		[
			triggerTransform,
			affineTransformationOnDrag,
			inverseAffineTransformationOnDrag,
			doKeepProportion,
		],
	);

	const linerDragFunctionLeftTop = useCallback(
		(p: Point) =>
			createLinerY2xFunction(
				startShape.current.leftTopPoint,
				startShape.current.rightBottomPoint,
			)(p),
		[],
	);
	// --- LeftTop End --- //

	// --- LeftBottom Start --- //
	const handleDragLeftBottom = useCallback(
		(e: DiagramDragEvent) => {
			const inversedDragPoint = inverseAffineTransformationOnDrag(e.endPoint);
			const inversedRightTop = inverseAffineTransformationOnDrag(
				startShape.current.rightTopPoint,
			);

			const newWidth = inversedRightTop.x - inversedDragPoint.x;
			let newHeight: number;
			if (doKeepProportion && startShape.current.aspectRatio) {
				newHeight =
					nanToZero(newWidth / startShape.current.aspectRatio) *
					startShape.current.scaleX *
					startShape.current.scaleY;
			} else {
				newHeight = inversedDragPoint.y - inversedRightTop.y;
			}

			const inversedCenter = {
				x: inversedRightTop.x - nanToZero(newWidth / 2),
				y: inversedRightTop.y + nanToZero(newHeight / 2),
			};
			const center = affineTransformationOnDrag(inversedCenter);

			triggerTransform(center, newWidth, newHeight, e.type);
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
			createLinerY2xFunction(
				startShape.current.rightTopPoint,
				startShape.current.leftBottomPoint,
			)(p),
		[],
	);
	// --- LeftTop Bottom --- //

	// --- RightTop Start --- //
	const handleDragRightTop = useCallback(
		(e: DiagramDragEvent) => {
			const inversedDragPoint = inverseAffineTransformationOnDrag(e.endPoint);
			const inversedLeftBottom = inverseAffineTransformationOnDrag(
				startShape.current.leftBottomPoint,
			);

			const newWidth = inversedDragPoint.x - inversedLeftBottom.x;
			let newHeight: number;
			if (doKeepProportion && startShape.current.aspectRatio) {
				newHeight =
					nanToZero(newWidth / startShape.current.aspectRatio) *
					startShape.current.scaleX *
					startShape.current.scaleY;
			} else {
				newHeight = inversedLeftBottom.y - inversedDragPoint.y;
			}

			const inversedCenter = {
				x: inversedLeftBottom.x + nanToZero(newWidth / 2),
				y: inversedLeftBottom.y - nanToZero(newHeight / 2),
			};
			const center = affineTransformationOnDrag(inversedCenter);

			triggerTransform(center, newWidth, newHeight, e.type);
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
			createLinerY2xFunction(
				startShape.current.rightTopPoint,
				startShape.current.leftBottomPoint,
			)(p),
		[],
	);
	// --- RightTop End --- //

	// --- RightBottom Start --- //
	const handleDragRightBottom = useCallback(
		(e: DiagramDragEvent) => {
			const inversedDragPoint = inverseAffineTransformationOnDrag(e.endPoint);
			const inversedLeftTop = inverseAffineTransformationOnDrag(
				startShape.current.leftTopPoint,
			);

			const newWidth = inversedDragPoint.x - inversedLeftTop.x;
			let newHeight: number;
			if (doKeepProportion && startShape.current.aspectRatio) {
				newHeight =
					nanToZero(newWidth / startShape.current.aspectRatio) *
					startShape.current.scaleX *
					startShape.current.scaleY;
			} else {
				newHeight = inversedDragPoint.y - inversedLeftTop.y;
			}

			const inversedCenter = {
				x: inversedLeftTop.x + (newWidth === 0 ? 0 : newWidth / 2),
				y: inversedLeftTop.y + (newHeight === 0 ? 0 : newHeight / 2),
			};
			const center = affineTransformationOnDrag(inversedCenter);

			triggerTransform(center, newWidth, newHeight, e.type);
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
			createLinerY2xFunction(
				startShape.current.rightBottomPoint,
				startShape.current.leftTopPoint,
			)(p),
		[],
	);
	// --- RightBottom End --- //

	// --- TopCenter Start --- //
	const handleDragTopCenter = useCallback(
		(e: DiagramDragEvent) => {
			const inversedDragPoint = inverseAffineTransformationOnDrag(e.endPoint);
			const inversedBottomCenter = inverseAffineTransformationOnDrag(
				startShape.current.bottomCenterPoint,
			);

			let newWidth: number;
			const newHeight = inversedBottomCenter.y - inversedDragPoint.y;
			if (doKeepProportion && startShape.current.aspectRatio) {
				newWidth =
					nanToZero(newHeight * startShape.current.aspectRatio) *
					startShape.current.scaleX *
					startShape.current.scaleY;
			} else {
				newWidth = startShape.current.width * startShape.current.scaleX;
			}

			const inversedCenter = {
				x: inversedBottomCenter.x,
				y: inversedBottomCenter.y - (newHeight === 0 ? 0 : newHeight / 2),
			};
			const center = affineTransformationOnDrag(inversedCenter);

			triggerTransform(center, newWidth, newHeight, e.type);
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
			!isSwapped
				? createLinerY2xFunction(
						startShape.current.bottomCenterPoint,
						startShape.current.topCenterPoint,
					)(p)
				: createLinerX2yFunction(
						startShape.current.bottomCenterPoint,
						startShape.current.topCenterPoint,
					)(p),
		[isSwapped],
	);
	// --- TopCenter End --- //

	// --- LeftCenter Start --- //
	const handleDragLeftCenter = useCallback(
		(e: DiagramDragEvent) => {
			const inversedDragPoint = inverseAffineTransformationOnDrag(e.endPoint);
			const inversedRightCenter = inverseAffineTransformationOnDrag(
				startShape.current.rightCenterPoint,
			);

			const newWidth = inversedRightCenter.x - inversedDragPoint.x;
			let newHeight: number;
			if (doKeepProportion && startShape.current.aspectRatio) {
				newHeight =
					nanToZero(newWidth / startShape.current.aspectRatio) *
					startShape.current.scaleX *
					startShape.current.scaleY;
			} else {
				newHeight = startShape.current.height * startShape.current.scaleY;
			}

			const inversedCenter = {
				x: inversedRightCenter.x - (newWidth === 0 ? 0 : newWidth / 2),
				y: inversedRightCenter.y,
			};
			const center = affineTransformationOnDrag(inversedCenter);

			triggerTransform(center, newWidth, newHeight, e.type);
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
			!isSwapped
				? createLinerX2yFunction(
						startShape.current.leftCenterPoint,
						startShape.current.rightCenterPoint,
					)(p)
				: createLinerY2xFunction(
						startShape.current.leftCenterPoint,
						startShape.current.rightCenterPoint,
					)(p),
		[isSwapped],
	);
	// --- LeftCenter End --- //

	// --- RightCenter Start --- //
	const handleDragRightCenter = useCallback(
		(e: DiagramDragEvent) => {
			const inversedDragPoint = inverseAffineTransformationOnDrag(e.endPoint);
			const inversedLeftCenter = inverseAffineTransformationOnDrag(
				startShape.current.leftCenterPoint,
			);

			const newWidth = inversedDragPoint.x - inversedLeftCenter.x;
			let newHeight: number;
			if (doKeepProportion && startShape.current.aspectRatio) {
				newHeight =
					nanToZero(newWidth / startShape.current.aspectRatio) *
					startShape.current.scaleX *
					startShape.current.scaleY;
			} else {
				newHeight = startShape.current.height * startShape.current.scaleY;
			}

			const inversedCenter = {
				x: inversedLeftCenter.x + (newWidth === 0 ? 0 : newWidth / 2),
				y: inversedLeftCenter.y,
			};
			const center = affineTransformationOnDrag(inversedCenter);

			triggerTransform(center, newWidth, newHeight, e.type);
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
			!isSwapped
				? createLinerX2yFunction(
						startShape.current.leftCenterPoint,
						startShape.current.rightCenterPoint,
					)(p)
				: createLinerY2xFunction(
						startShape.current.leftCenterPoint,
						startShape.current.rightCenterPoint,
					)(p),
		[isSwapped],
	);
	// --- RightCenter End --- //

	// --- BottomCenter Start --- //
	const handleDragBottomCenter = useCallback(
		(e: DiagramDragEvent) => {
			const inversedDragPoint = inverseAffineTransformationOnDrag(e.endPoint);
			const inversedTopCenter = inverseAffineTransformationOnDrag(
				startShape.current.topCenterPoint,
			);

			let newWidth: number;
			const newHeight = inversedDragPoint.y - inversedTopCenter.y;
			if (doKeepProportion && startShape.current.aspectRatio) {
				newWidth =
					nanToZero(newHeight * startShape.current.aspectRatio) *
					startShape.current.scaleX *
					startShape.current.scaleY;
			} else {
				newWidth = startShape.current.width * startShape.current.scaleX;
			}

			const inversedCenter = {
				x: inversedTopCenter.x,
				y: inversedTopCenter.y + (newHeight === 0 ? 0 : newHeight / 2),
			};
			const center = affineTransformationOnDrag(inversedCenter);

			triggerTransform(center, newWidth, newHeight, e.type);
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
			!isSwapped
				? createLinerY2xFunction(
						startShape.current.bottomCenterPoint,
						startShape.current.topCenterPoint,
					)(p)
				: createLinerX2yFunction(
						startShape.current.bottomCenterPoint,
						startShape.current.topCenterPoint,
					)(p),
		[isSwapped],
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
	const rotationPoint = useMemo(
		() =>
			affineTransformation(
				{ x: width / 2 + 15, y: -(height / 2 + 15) },
				1,
				1,
				degreesToRadians(rotation),
				point.x,
				point.y,
			),
		[width, height, rotation, point],
	);

	const handleDragRotationPoint = useCallback(
		(e: DiagramDragEvent) => {
			const angle = calculateAngle(point, e.endPoint);
			const rotatePointAngle = calculateAngle(point, {
				x: point.x + width,
				y: point.y + height,
			});
			const event = {
				id: diagramId,
				startShape: {
					...startShape.current,
				},
				endShape: {
					point,
					width,
					height,
					scaleX,
					scaleY,
					rotation: radiansToDegrees(angle + rotatePointAngle),
				},
			};

			if (e.type === "dragEnd") {
				onTransformEnd?.(event);
			} else {
				onTransform?.(event);
			}
		},
		[
			onTransform,
			onTransformEnd,
			diagramId,
			point,
			width,
			height,
			scaleX,
			scaleY,
		],
	);

	const dragFunctionRotationPoint = useCallback(
		(p: Point) =>
			calcNearestCircleIntersectionPoint(
				{ x: point.x, y: point.y },
				width / 2 + 15,
				p,
			),
		[point, width],
	);

	// TODO: 変形中は計算しないほうがよい
	const cursors = useMemo(() => {
		return {
			topCenter: getCursorFromAngle(rotation),
			rightTop: getCursorFromAngle(rotation + 45),
			rightCenter: getCursorFromAngle(rotation + 90),
			rightBottom: getCursorFromAngle(rotation + 135),
			bottomCenter: getCursorFromAngle(rotation + 180),
			leftBottom: getCursorFromAngle(rotation + 225),
			leftCenter: getCursorFromAngle(rotation + 270),
			leftTop: getCursorFromAngle(rotation + 315),
		};
	}, [rotation]);

	if (!isSelected) {
		return null;
	}

	return (
		<>
			{/* アウトライン */}
			<g transform="translate(0.5,0.5)">
				<rect
					x={-width / 2}
					y={-height / 2}
					width={width}
					height={height}
					fill="transparent"
					stroke="rgb(100, 149, 237)"
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
			</g>
			{/* 上辺 */}
			<DragLine
				id={`${diagramId}-topCenter-line`}
				point={vertices.topCenterPoint}
				startPoint={vertices.leftTopPoint}
				endPoint={vertices.rightTopPoint}
				cursor={cursors.topCenter}
				onDragStart={handleDragStart}
				onDrag={handleDragTopCenter}
				onDragEnd={handleDragTopCenter}
				dragPositioningFunction={linerDragFunctionTopCenter}
			/>
			{/* 左辺 */}
			<DragLine
				id={`${diagramId}-leftCenter-line`}
				point={vertices.leftCenterPoint}
				startPoint={vertices.leftTopPoint}
				endPoint={vertices.leftBottomPoint}
				cursor={cursors.leftCenter}
				onDragStart={handleDragStart}
				onDrag={handleDragLeftCenter}
				onDragEnd={handleDragLeftCenter}
				dragPositioningFunction={linerDragFunctionLeftCenter}
			/>
			{/* 右辺 */}
			<DragLine
				id={`${diagramId}-rightCenter-line`}
				point={vertices.rightCenterPoint}
				startPoint={vertices.rightTopPoint}
				endPoint={vertices.rightBottomPoint}
				cursor={cursors.rightCenter}
				onDragStart={handleDragStart}
				onDrag={handleDragRightCenter}
				onDragEnd={handleDragRightCenter}
				dragPositioningFunction={linerDragFunctionRightCenter}
			/>
			{/* 下辺 */}
			<DragLine
				id={`${diagramId}-bottomCenter-line`}
				point={vertices.bottomCenterPoint}
				startPoint={vertices.leftBottomPoint}
				endPoint={vertices.rightBottomPoint}
				cursor={cursors.bottomCenter}
				onDragStart={handleDragStart}
				onDrag={handleDragBottomCenter}
				onDragEnd={handleDragBottomCenter}
				dragPositioningFunction={linerDragFunctionBottomCenter}
			/>
			{/* 左上 */}
			<DragPoint
				id={`${diagramId}-leftTop`}
				point={vertices.leftTopPoint}
				cursor={cursors.leftTop}
				onDragStart={handleDragStart}
				onDrag={handleDragLeftTop}
				onDragEnd={handleDragLeftTop}
				dragPositioningFunction={
					doKeepProportion ? linerDragFunctionLeftTop : undefined
				}
			/>
			{/* 左下 */}
			<DragPoint
				id={`${diagramId}-leftBottom`}
				point={vertices.leftBottomPoint}
				cursor={cursors.leftBottom}
				onDragStart={handleDragStart}
				onDrag={handleDragLeftBottom}
				onDragEnd={handleDragLeftBottom}
				dragPositioningFunction={
					doKeepProportion ? linerDragFunctionLeftBottom : undefined
				}
			/>
			{/* 右上 */}
			<DragPoint
				id={`${diagramId}-rightTop`}
				point={vertices.rightTopPoint}
				cursor={cursors.rightTop}
				onDragStart={handleDragStart}
				onDrag={handleDragRightTop}
				onDragEnd={handleDragRightTop}
				dragPositioningFunction={
					doKeepProportion ? linerDragFunctionRightTop : undefined
				}
			/>
			{/* 右下 */}
			<DragPoint
				id={`${diagramId}-rightBottom`}
				point={vertices.rightBottomPoint}
				cursor={cursors.rightBottom}
				onDragStart={handleDragStart}
				onDrag={handleDragRightBottom}
				onDragEnd={handleDragRightBottom}
				dragPositioningFunction={
					doKeepProportion ? linerDragFunctionRightBottom : undefined
				}
			/>
			{/* 上中央 */}
			<DragPoint
				id={`${diagramId}-topCenter`}
				point={vertices.topCenterPoint}
				cursor={cursors.topCenter}
				onDragStart={handleDragStart}
				onDrag={handleDragTopCenter}
				onDragEnd={handleDragTopCenter}
				dragPositioningFunction={linerDragFunctionTopCenter}
			/>
			{/* 左中央 */}
			<DragPoint
				id={`${diagramId}-leftCenter`}
				point={vertices.leftCenterPoint}
				cursor={cursors.leftCenter}
				onDragStart={handleDragStart}
				onDrag={handleDragLeftCenter}
				onDragEnd={handleDragLeftCenter}
				dragPositioningFunction={linerDragFunctionLeftCenter}
			/>
			{/* 右中央 */}
			<DragPoint
				id={`${diagramId}-rightCenter`}
				point={vertices.rightCenterPoint}
				cursor={cursors.rightCenter}
				onDragStart={handleDragStart}
				onDrag={handleDragRightCenter}
				onDragEnd={handleDragRightCenter}
				dragPositioningFunction={linerDragFunctionRightCenter}
			/>
			{/* 下中央 */}
			<DragPoint
				id={`${diagramId}-bottomCenter`}
				point={vertices.bottomCenterPoint}
				cursor={cursors.bottomCenter}
				onDragStart={handleDragStart}
				onDrag={handleDragBottomCenter}
				onDragEnd={handleDragBottomCenter}
				dragPositioningFunction={linerDragFunctionBottomCenter}
			/>
			{/* 回転 */}
			<RotatePoint
				id={`rotation-${diagramId}`}
				point={rotationPoint}
				rotation={rotation}
				onDragStart={handleDragStart}
				onDrag={handleDragRotationPoint}
				onDragEnd={handleDragRotationPoint}
				dragPositioningFunction={dragFunctionRotationPoint}
			/>
		</>
	);
};

export default memo(Transformative);
