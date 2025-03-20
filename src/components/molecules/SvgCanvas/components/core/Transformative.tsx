// Reactのインポート
import type React from "react";
import { memo, useCallback, useEffect, useRef, useState } from "react";

// SvgCanvas関連型定義をインポート
import type { Point } from "../../types/CoordinateTypes";
import type {
	DiagramType,
	SelectableData,
	TransformativeData,
	TransformativeProps,
} from "../../types/DiagramTypes";
import type { DiagramDragEvent, EventType } from "../../types/EventTypes";

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
	calcRadians,
	calcRectangleVertices,
	createLinerX2yFunction,
	createLinerY2xFunction,
	degreesToRadians,
	inverseAffineTransformation,
	nanToZero,
	radiansToDegrees,
	signNonZero,
} from "../../functions/Math";

/** 回転ポイントのマージン */
const ROTATE_POINT_MARGIN = 15;

/**
 * 変形コンポーネントのプロパティ
 */
type Props = TransformativeData &
	SelectableData &
	TransformativeProps & {
		diagramId: string;
		type: DiagramType;
	};

/**
 * 変形コンポーネント
 */
const Transformative: React.FC<Props> = ({
	diagramId,
	x,
	y,
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

	const startShape = useRef({
		x,
		y,
		width,
		height,
		rotation,
		scaleX,
		scaleY,
		aspectRatio: width / height,
		...calcRectangleVertices({
			x,
			y,
			width,
			height,
			rotation,
			scaleX,
			scaleY,
		}),
	});

	const vertices = calcRectangleVertices({
		x,
		y,
		width,
		height,
		rotation,
		scaleX,
		scaleY,
	});

	const radians = degreesToRadians(rotation);
	const isSwapped = (rotation + 405) % 180 > 90;

	const affineTransformationOnDrag = (x: number, y: number) =>
		affineTransformation(
			x,
			y,
			1,
			1,
			radians,
			startShape.current.x,
			startShape.current.y,
		);

	const inverseAffineTransformationOnDrag = (x: number, y: number) =>
		inverseAffineTransformation(
			x,
			y,
			1,
			1,
			radians,
			startShape.current.x,
			startShape.current.y,
		);

	const triggerTransformStart = () => {
		startShape.current = {
			x,
			y,
			width,
			height,
			rotation,
			scaleX,
			scaleY,
			aspectRatio: width / height,
			...vertices,
		};

		onTransform?.({
			eventType: "Start",
			id: diagramId,
			startShape: startShape.current,
			endShape: startShape.current,
		});
	};

	const triggerTransform = (
		centerPoint: Point,
		newWidth: number,
		newHeight: number,
		eventType: EventType,
	) => {
		const event = {
			eventType,
			id: diagramId,
			startShape: {
				...startShape.current,
			},
			endShape: {
				x: centerPoint.x,
				y: centerPoint.y,
				width: Math.abs(newWidth),
				height: Math.abs(newHeight),
				scaleX: signNonZero(newWidth),
				scaleY: signNonZero(newHeight),
				rotation,
			},
		};

		onTransform?.(event);
	};

	// ハンドラ生成の頻発を回避するため、参照する値をuseRefで保持する
	const refBusVal = {
		// プロパティ
		diagramId,
		x,
		y,
		width,
		height,
		rotation,
		scaleX,
		scaleY,
		onTransform,
		// 内部変数・内部関数
		vertices,
		doKeepProportion,
		isSwapped,
		affineTransformationOnDrag,
		inverseAffineTransformationOnDrag,
		triggerTransformStart,
		triggerTransform,
	};
	const refBus = useRef(refBusVal);
	refBus.current = refBusVal;

	// --- LeftTop Start --- //
	const handleDragLeftTop = useCallback((e: DiagramDragEvent) => {
		const {
			doKeepProportion,
			inverseAffineTransformationOnDrag,
			affineTransformationOnDrag,
			triggerTransformStart,
			triggerTransform,
		} = refBus.current;

		if (e.eventType === "Start") {
			return triggerTransformStart();
		}

		const inversedDragPoint = inverseAffineTransformationOnDrag(e.endX, e.endY);
		const inversedRightBottom = inverseAffineTransformationOnDrag(
			startShape.current.rightBottomPoint.x,
			startShape.current.rightBottomPoint.y,
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

		const inversedCenterX = inversedRightBottom.x - nanToZero(newWidth / 2);
		const inversedCenterY = inversedRightBottom.y - nanToZero(newHeight / 2);

		const center = affineTransformationOnDrag(inversedCenterX, inversedCenterY);

		triggerTransform(center, newWidth, newHeight, e.eventType);
	}, []);

	const linerDragFunctionLeftTop = useCallback(
		(x: number, y: number) =>
			createLinerY2xFunction(
				startShape.current.leftTopPoint,
				startShape.current.rightBottomPoint,
			)(x, y),
		[],
	);
	// --- LeftTop End --- //

	// --- LeftBottom Start --- //
	const handleDragLeftBottom = useCallback((e: DiagramDragEvent) => {
		const {
			doKeepProportion,
			inverseAffineTransformationOnDrag,
			affineTransformationOnDrag,
			triggerTransformStart,
			triggerTransform,
		} = refBus.current;

		if (e.eventType === "Start") {
			return triggerTransformStart();
		}

		const inversedDragPoint = inverseAffineTransformationOnDrag(e.endX, e.endY);
		const inversedRightTop = inverseAffineTransformationOnDrag(
			startShape.current.rightTopPoint.x,
			startShape.current.rightTopPoint.y,
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

		const inversedCenterX = inversedRightTop.x - nanToZero(newWidth / 2);
		const inversedCenterY = inversedRightTop.y + nanToZero(newHeight / 2);

		const center = affineTransformationOnDrag(inversedCenterX, inversedCenterY);

		triggerTransform(center, newWidth, newHeight, e.eventType);
	}, []);

	const linerDragFunctionLeftBottom = useCallback(
		(x: number, y: number) =>
			createLinerY2xFunction(
				startShape.current.rightTopPoint,
				startShape.current.leftBottomPoint,
			)(x, y),
		[],
	);
	// --- LeftTop Bottom --- //

	// --- RightTop Start --- //
	const handleDragRightTop = useCallback((e: DiagramDragEvent) => {
		const {
			doKeepProportion,
			inverseAffineTransformationOnDrag,
			affineTransformationOnDrag,
			triggerTransformStart,
			triggerTransform,
		} = refBus.current;

		if (e.eventType === "Start") {
			return triggerTransformStart();
		}

		const inversedDragPoint = inverseAffineTransformationOnDrag(e.endX, e.endY);
		const inversedLeftBottom = inverseAffineTransformationOnDrag(
			startShape.current.leftBottomPoint.x,
			startShape.current.leftBottomPoint.y,
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

		const inversedCenterX = inversedLeftBottom.x + nanToZero(newWidth / 2);
		const inversedCenterY = inversedLeftBottom.y - nanToZero(newHeight / 2);

		const center = affineTransformationOnDrag(inversedCenterX, inversedCenterY);

		triggerTransform(center, newWidth, newHeight, e.eventType);
	}, []);

	const linerDragFunctionRightTop = useCallback(
		(x: number, y: number) =>
			createLinerY2xFunction(
				startShape.current.rightTopPoint,
				startShape.current.leftBottomPoint,
			)(x, y),
		[],
	);
	// --- RightTop End --- //

	// --- RightBottom Start --- //
	const handleDragRightBottom = useCallback((e: DiagramDragEvent) => {
		const {
			doKeepProportion,
			inverseAffineTransformationOnDrag,
			affineTransformationOnDrag,
			triggerTransformStart,
			triggerTransform,
		} = refBus.current;

		if (e.eventType === "Start") {
			return triggerTransformStart();
		}

		const inversedDragPoint = inverseAffineTransformationOnDrag(e.endX, e.endY);
		const inversedLeftTop = inverseAffineTransformationOnDrag(
			startShape.current.leftTopPoint.x,
			startShape.current.leftTopPoint.y,
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

		const inversedCenterX = inversedLeftTop.x + nanToZero(newWidth / 2);
		const inversedCenterY = inversedLeftTop.y + nanToZero(newHeight / 2);

		const center = affineTransformationOnDrag(inversedCenterX, inversedCenterY);

		triggerTransform(center, newWidth, newHeight, e.eventType);
	}, []);

	const linerDragFunctionRightBottom = useCallback(
		(x: number, y: number) =>
			createLinerY2xFunction(
				startShape.current.rightBottomPoint,
				startShape.current.leftTopPoint,
			)(x, y),
		[],
	);
	// --- RightBottom End --- //

	// --- TopCenter Start --- //
	const handleDragTopCenter = useCallback((e: DiagramDragEvent) => {
		const {
			doKeepProportion,
			inverseAffineTransformationOnDrag,
			affineTransformationOnDrag,
			triggerTransformStart,
			triggerTransform,
		} = refBus.current;

		if (e.eventType === "Start") {
			return triggerTransformStart();
		}

		const inversedDragPoint = inverseAffineTransformationOnDrag(e.endX, e.endY);
		const inversedBottomCenter = inverseAffineTransformationOnDrag(
			startShape.current.bottomCenterPoint.x,
			startShape.current.bottomCenterPoint.y,
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

		const inversedCenterX = inversedBottomCenter.x;
		const inversedCenterY = inversedBottomCenter.y - nanToZero(newHeight / 2);

		const center = affineTransformationOnDrag(inversedCenterX, inversedCenterY);

		triggerTransform(center, newWidth, newHeight, e.eventType);
	}, []);

	const linerDragFunctionTopCenter = useCallback(
		(x: number, y: number) =>
			!refBus.current.isSwapped
				? createLinerY2xFunction(
						startShape.current.bottomCenterPoint,
						startShape.current.topCenterPoint,
					)(x, y)
				: createLinerX2yFunction(
						startShape.current.bottomCenterPoint,
						startShape.current.topCenterPoint,
					)(x, y),
		[],
	);
	// --- TopCenter End --- //

	// --- LeftCenter Start --- //
	const handleDragLeftCenter = useCallback((e: DiagramDragEvent) => {
		const {
			doKeepProportion,
			inverseAffineTransformationOnDrag,
			affineTransformationOnDrag,
			triggerTransformStart,
			triggerTransform,
		} = refBus.current;

		if (e.eventType === "Start") {
			return triggerTransformStart();
		}

		const inversedDragPoint = inverseAffineTransformationOnDrag(e.endX, e.endY);
		const inversedRightCenter = inverseAffineTransformationOnDrag(
			startShape.current.rightCenterPoint.x,
			startShape.current.rightCenterPoint.y,
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

		const inversedCenterX = inversedRightCenter.x - nanToZero(newWidth / 2);
		const inversedCenterY = inversedRightCenter.y;

		const center = affineTransformationOnDrag(inversedCenterX, inversedCenterY);

		triggerTransform(center, newWidth, newHeight, e.eventType);
	}, []);

	const linerDragFunctionLeftCenter = useCallback(
		(x: number, y: number) =>
			!refBus.current.isSwapped
				? createLinerX2yFunction(
						startShape.current.leftCenterPoint,
						startShape.current.rightCenterPoint,
					)(x, y)
				: createLinerY2xFunction(
						startShape.current.leftCenterPoint,
						startShape.current.rightCenterPoint,
					)(x, y),
		[],
	);
	// --- LeftCenter End --- //

	// --- RightCenter Start --- //
	const handleDragRightCenter = useCallback((e: DiagramDragEvent) => {
		const {
			doKeepProportion,
			inverseAffineTransformationOnDrag,
			affineTransformationOnDrag,
			triggerTransformStart,
			triggerTransform,
		} = refBus.current;

		if (e.eventType === "Start") {
			return triggerTransformStart();
		}

		const inversedDragPoint = inverseAffineTransformationOnDrag(e.endX, e.endY);
		const inversedLeftCenter = inverseAffineTransformationOnDrag(
			startShape.current.leftCenterPoint.x,
			startShape.current.leftCenterPoint.y,
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

		const inversedCenterX = inversedLeftCenter.x + nanToZero(newWidth / 2);
		const inversedCenterY = inversedLeftCenter.y;

		const center = affineTransformationOnDrag(inversedCenterX, inversedCenterY);

		triggerTransform(center, newWidth, newHeight, e.eventType);
	}, []);

	const linerDragFunctionRightCenter = useCallback(
		(x: number, y: number) =>
			!refBus.current.isSwapped
				? createLinerX2yFunction(
						startShape.current.leftCenterPoint,
						startShape.current.rightCenterPoint,
					)(x, y)
				: createLinerY2xFunction(
						startShape.current.leftCenterPoint,
						startShape.current.rightCenterPoint,
					)(x, y),
		[],
	);
	// --- RightCenter End --- //

	// --- BottomCenter Start --- //
	const handleDragBottomCenter = useCallback((e: DiagramDragEvent) => {
		const {
			doKeepProportion,
			inverseAffineTransformationOnDrag,
			affineTransformationOnDrag,
			triggerTransformStart,
			triggerTransform,
		} = refBus.current;

		if (e.eventType === "Start") {
			return triggerTransformStart();
		}

		const inversedDragPoint = inverseAffineTransformationOnDrag(e.endX, e.endY);
		const inversedTopCenter = inverseAffineTransformationOnDrag(
			startShape.current.topCenterPoint.x,
			startShape.current.topCenterPoint.y,
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

		const inversedCenterX = inversedTopCenter.x;
		const inversedCenterY = inversedTopCenter.y + nanToZero(newHeight / 2);

		const center = affineTransformationOnDrag(inversedCenterX, inversedCenterY);

		triggerTransform(center, newWidth, newHeight, e.eventType);
	}, []);

	const linerDragFunctionBottomCenter = useCallback(
		(x: number, y: number) =>
			!refBus.current.isSwapped
				? createLinerY2xFunction(
						startShape.current.bottomCenterPoint,
						startShape.current.topCenterPoint,
					)(x, y)
				: createLinerX2yFunction(
						startShape.current.bottomCenterPoint,
						startShape.current.topCenterPoint,
					)(x, y),
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
	const rotationPoint = affineTransformation(
		width / 2 + ROTATE_POINT_MARGIN,
		-(height / 2 + ROTATE_POINT_MARGIN),
		1,
		1,
		radians,
		x,
		y,
	);

	/**
	 * 回転ポイントのドラッグハンドラ
	 */
	const handleDragRotationPoint = useCallback((e: DiagramDragEvent) => {
		const {
			diagramId,
			x,
			y,
			width,
			height,
			scaleX,
			scaleY,
			onTransform,
			triggerTransformStart,
		} = refBus.current;

		if (e.eventType === "Start") {
			return triggerTransformStart();
		}

		const radian = calcRadians(x, y, e.endX, e.endY);
		const rotatePointRadian = calcRadians(x, y, x + width, y - height);
		const newRotation = Math.round(
			(radiansToDegrees(radian - rotatePointRadian) + 360) % 360,
		);
		const event = {
			eventType: e.eventType,
			id: diagramId,
			startShape: {
				...startShape.current,
			},
			endShape: {
				x,
				y,
				width,
				height,
				scaleX,
				scaleY,
				rotation: newRotation,
			},
		};

		onTransform?.(event);
	}, []);

	const dragFunctionRotationPoint = useCallback((rx: number, ry: number) => {
		const { x, y, width } = refBus.current;

		return calcNearestCircleIntersectionPoint(
			x,
			y,
			width / 2 + ROTATE_POINT_MARGIN,
			rx,
			ry,
		);
	}, []);

	const cursors = {
		topCenter: getCursorFromAngle(rotation),
		rightTop: getCursorFromAngle(rotation + 45),
		rightCenter: getCursorFromAngle(rotation + 90),
		rightBottom: getCursorFromAngle(rotation + 135),
		bottomCenter: getCursorFromAngle(rotation + 180),
		leftBottom: getCursorFromAngle(rotation + 225),
		leftCenter: getCursorFromAngle(rotation + 270),
		leftTop: getCursorFromAngle(rotation + 315),
	};

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
					transform={createSvgTransform(scaleX, scaleY, radians, x, y)}
				/>
			</g>
			{/* 上辺 */}
			<DragLine
				id={`${diagramId}-topCenter-line`}
				x={vertices.topCenterPoint.x}
				y={vertices.topCenterPoint.y}
				startX={vertices.leftTopPoint.x}
				startY={vertices.leftTopPoint.y}
				endX={vertices.rightTopPoint.x}
				endY={vertices.rightTopPoint.y}
				cursor={cursors.topCenter}
				onDrag={handleDragTopCenter}
				dragPositioningFunction={linerDragFunctionTopCenter}
			/>
			{/* 左辺 */}
			<DragLine
				id={`${diagramId}-leftCenter-line`}
				x={vertices.leftCenterPoint.x}
				y={vertices.leftCenterPoint.y}
				startX={vertices.leftTopPoint.x}
				startY={vertices.leftTopPoint.y}
				endX={vertices.leftBottomPoint.x}
				endY={vertices.leftBottomPoint.y}
				cursor={cursors.leftCenter}
				onDrag={handleDragLeftCenter}
				dragPositioningFunction={linerDragFunctionLeftCenter}
			/>
			{/* 右辺 */}
			<DragLine
				id={`${diagramId}-rightCenter-line`}
				x={vertices.rightCenterPoint.x}
				y={vertices.rightCenterPoint.y}
				startX={vertices.rightTopPoint.x}
				startY={vertices.rightTopPoint.y}
				endX={vertices.rightBottomPoint.x}
				endY={vertices.rightBottomPoint.y}
				cursor={cursors.rightCenter}
				onDrag={handleDragRightCenter}
				dragPositioningFunction={linerDragFunctionRightCenter}
			/>
			{/* 下辺 */}
			<DragLine
				id={`${diagramId}-bottomCenter-line`}
				x={vertices.bottomCenterPoint.x}
				y={vertices.bottomCenterPoint.y}
				startX={vertices.leftBottomPoint.x}
				startY={vertices.leftBottomPoint.y}
				endX={vertices.rightBottomPoint.x}
				endY={vertices.rightBottomPoint.y}
				cursor={cursors.bottomCenter}
				onDrag={handleDragBottomCenter}
				dragPositioningFunction={linerDragFunctionBottomCenter}
			/>
			{/* 左上 */}
			<DragPoint
				id={`${diagramId}-leftTop`}
				x={vertices.leftTopPoint.x}
				y={vertices.leftTopPoint.y}
				cursor={cursors.leftTop}
				onDrag={handleDragLeftTop}
				dragPositioningFunction={
					doKeepProportion ? linerDragFunctionLeftTop : undefined
				}
			/>
			{/* 左下 */}
			<DragPoint
				id={`${diagramId}-leftBottom`}
				x={vertices.leftBottomPoint.x}
				y={vertices.leftBottomPoint.y}
				cursor={cursors.leftBottom}
				onDrag={handleDragLeftBottom}
				dragPositioningFunction={
					doKeepProportion ? linerDragFunctionLeftBottom : undefined
				}
			/>
			{/* 右上 */}
			<DragPoint
				id={`${diagramId}-rightTop`}
				x={vertices.rightTopPoint.x}
				y={vertices.rightTopPoint.y}
				cursor={cursors.rightTop}
				onDrag={handleDragRightTop}
				dragPositioningFunction={
					doKeepProportion ? linerDragFunctionRightTop : undefined
				}
			/>
			{/* 右下 */}
			<DragPoint
				id={`${diagramId}-rightBottom`}
				x={vertices.rightBottomPoint.x}
				y={vertices.rightBottomPoint.y}
				cursor={cursors.rightBottom}
				onDrag={handleDragRightBottom}
				dragPositioningFunction={
					doKeepProportion ? linerDragFunctionRightBottom : undefined
				}
			/>
			{/* 上中央 */}
			<DragPoint
				id={`${diagramId}-topCenter`}
				x={vertices.topCenterPoint.x}
				y={vertices.topCenterPoint.y}
				cursor={cursors.topCenter}
				onDrag={handleDragTopCenter}
				dragPositioningFunction={linerDragFunctionTopCenter}
			/>
			{/* 左中央 */}
			<DragPoint
				id={`${diagramId}-leftCenter`}
				x={vertices.leftCenterPoint.x}
				y={vertices.leftCenterPoint.y}
				cursor={cursors.leftCenter}
				onDrag={handleDragLeftCenter}
				dragPositioningFunction={linerDragFunctionLeftCenter}
			/>
			{/* 右中央 */}
			<DragPoint
				id={`${diagramId}-rightCenter`}
				x={vertices.rightCenterPoint.x}
				y={vertices.rightCenterPoint.y}
				cursor={cursors.rightCenter}
				onDrag={handleDragRightCenter}
				dragPositioningFunction={linerDragFunctionRightCenter}
			/>
			{/* 下中央 */}
			<DragPoint
				id={`${diagramId}-bottomCenter`}
				x={vertices.bottomCenterPoint.x}
				y={vertices.bottomCenterPoint.y}
				cursor={cursors.bottomCenter}
				onDrag={handleDragBottomCenter}
				dragPositioningFunction={linerDragFunctionBottomCenter}
			/>
			{/* 回転 */}
			<RotatePoint
				id={`rotation-${diagramId}`}
				x={rotationPoint.x}
				y={rotationPoint.y}
				rotation={rotation}
				onDrag={handleDragRotationPoint}
				dragPositioningFunction={dragFunctionRotationPoint}
			/>
		</>
	);
};

export default memo(Transformative);
