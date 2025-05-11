// Import React.
import type React from "react";
import { memo, useCallback, useEffect, useRef, useState } from "react";

// Import types related to SvgCanvas.
import type { Point } from "../../../types/CoordinateTypes";
import type {
	DiagramType,
	SelectableData,
	TransformativeData,
} from "../../../types/base";
import type { TransformativeProps } from "../../../types/DiagramTypes";
import type { DiagramDragEvent, EventType } from "../../../types/EventTypes";

// Import components related to SvgCanvas.
import { BottomLabel } from "../BottomLabel";
import { DragLine } from "../DragLine";
import { DragPoint } from "../DragPoint";
import { RotatePoint } from "../RotatePoint";

// Import functions related to SvgCanvas.
import { createSvgTransform, getCursorFromAngle } from "../../../utils/diagram";
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
} from "../../../utils";

// Imports related to this component.
import { ROTATE_POINT_MARGIN } from "./TransformativeConstants";

/**
 * 変形コンポーネントのプロパティ
 */
type Props = TransformativeData &
	SelectableData &
	TransformativeProps & {
		id: string;
		type: DiagramType;
	};

/**
 * 変形コンポーネント
 */
const TransformativeComponent: React.FC<Props> = ({
	id,
	x,
	y,
	width,
	height,
	rotation,
	scaleX,
	scaleY,
	keepProportion,
	isSelected,
	isMultiSelectSource,
	onTransform,
}) => {
	const [isResizing, setIsResizing] = useState(false);
	const [isRotating, setIsRotating] = useState(false);
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

	const triggerTransformStart = (eventId: string) => {
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
			eventId,
			eventType: "Start",
			id,
			startShape: startShape.current,
			endShape: startShape.current,
		});
	};

	const triggerTransform = (
		eventId: string,
		centerPoint: Point,
		newWidth: number,
		newHeight: number,
		eventType: EventType,
		cursorX?: number,
		cursorY?: number,
	) => {
		const event = {
			eventId,
			eventType,
			id,
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
			cursorX: cursorX ?? centerPoint.x, // カーソル位置が提供されない場合は中心点を使用
			cursorY: cursorY ?? centerPoint.y, // カーソル位置が提供されない場合は中心点を使用
		};

		onTransform?.(event);
	};

	const setResizingByEvent = (eventType: EventType) => {
		if (eventType === "Start") {
			setIsResizing(true);
		} else if (eventType === "End") {
			setIsResizing(false);
		}
	};

	/**
	 * Calculates the height that maintains the original aspect ratio.
	 *
	 * @param width - The new width (can be negative when flipped)
	 * @param aspectRatio - The original aspect ratio (width / height)
	 * @param scaleX - Horizontal scaling factor (can include flip)
	 * @param scaleY - Vertical scaling factor (can include flip)
	 * @returns The calculated height, preserving the aspect ratio
	 */
	const calcHeightWithAspectRatio = (
		width: number,
		aspectRatio: number,
		scaleX: number,
		scaleY: number,
	) => {
		return nanToZero(width / aspectRatio) * scaleX * scaleY;
	};

	/**
	 * Calculates the width that maintains the original aspect ratio.
	 *
	 * @param height - The new height (can be negative when flipped)
	 * @param aspectRatio - The original aspect ratio (width / height)
	 * @param scaleX - Horizontal scaling factor (can include flip)
	 * @param scaleY - Vertical scaling factor (can include flip)
	 * @returns The calculated width, preserving the aspect ratio
	 */
	const calcWidthWithAspectRatio = (
		height: number,
		aspectRatio: number,
		scaleX: number,
		scaleY: number,
	) => {
		return nanToZero(height * aspectRatio) * scaleX * scaleY;
	};

	// Create references bypass to avoid function creation in every render.
	const refBusVal = {
		// Component properties
		id,
		x,
		y,
		width,
		height,
		rotation,
		scaleX,
		scaleY,
		onTransform,
		// Internal variables and functions
		vertices,
		doKeepProportion,
		isSwapped,
		affineTransformationOnDrag,
		inverseAffineTransformationOnDrag,
		triggerTransformStart,
		triggerTransform,
		setResizingByEvent,
		calcHeightWithAspectRatio,
		calcWidthWithAspectRatio,
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
			setResizingByEvent,
			calcHeightWithAspectRatio,
		} = refBus.current;

		setResizingByEvent(e.eventType);

		if (e.eventType === "Start") {
			return triggerTransformStart(e.eventId);
		}

		const inversedDragPoint = inverseAffineTransformationOnDrag(e.endX, e.endY);
		const inversedRightBottom = inverseAffineTransformationOnDrag(
			startShape.current.rightBottomPoint.x,
			startShape.current.rightBottomPoint.y,
		);

		const newWidth = inversedRightBottom.x - inversedDragPoint.x;
		let newHeight: number;
		if (doKeepProportion && startShape.current.aspectRatio) {
			newHeight = calcHeightWithAspectRatio(
				newWidth,
				startShape.current.aspectRatio,
				startShape.current.scaleX,
				startShape.current.scaleY,
			);
		} else {
			newHeight = inversedRightBottom.y - inversedDragPoint.y;
		}

		const inversedCenterX = inversedRightBottom.x - nanToZero(newWidth / 2);
		const inversedCenterY = inversedRightBottom.y - nanToZero(newHeight / 2);

		const center = affineTransformationOnDrag(inversedCenterX, inversedCenterY);

		// カーソル位置を渡して自動スクロールを有効にする
		triggerTransform(
			e.eventId,
			center,
			newWidth,
			newHeight,
			e.eventType,
			e.cursorX,
			e.cursorY,
		);
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
			setResizingByEvent,
			calcHeightWithAspectRatio,
		} = refBus.current;

		setResizingByEvent(e.eventType);

		if (e.eventType === "Start") {
			return triggerTransformStart(e.eventId);
		}

		const inversedDragPoint = inverseAffineTransformationOnDrag(e.endX, e.endY);
		const inversedRightTop = inverseAffineTransformationOnDrag(
			startShape.current.rightTopPoint.x,
			startShape.current.rightTopPoint.y,
		);

		const newWidth = inversedRightTop.x - inversedDragPoint.x;
		let newHeight: number;
		if (doKeepProportion && startShape.current.aspectRatio) {
			newHeight = calcHeightWithAspectRatio(
				newWidth,
				startShape.current.aspectRatio,
				startShape.current.scaleX,
				startShape.current.scaleY,
			);
		} else {
			newHeight = inversedDragPoint.y - inversedRightTop.y;
		}

		const inversedCenterX = inversedRightTop.x - nanToZero(newWidth / 2);
		const inversedCenterY = inversedRightTop.y + nanToZero(newHeight / 2);

		const center = affineTransformationOnDrag(inversedCenterX, inversedCenterY);

		triggerTransform(
			e.eventId,
			center,
			newWidth,
			newHeight,
			e.eventType,
			e.cursorX,
			e.cursorY,
		);
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
			setResizingByEvent,
			calcHeightWithAspectRatio,
		} = refBus.current;

		setResizingByEvent(e.eventType);

		if (e.eventType === "Start") {
			return triggerTransformStart(e.eventId);
		}

		const inversedDragPoint = inverseAffineTransformationOnDrag(e.endX, e.endY);
		const inversedLeftBottom = inverseAffineTransformationOnDrag(
			startShape.current.leftBottomPoint.x,
			startShape.current.leftBottomPoint.y,
		);

		const newWidth = inversedDragPoint.x - inversedLeftBottom.x;
		let newHeight: number;
		if (doKeepProportion && startShape.current.aspectRatio) {
			newHeight = calcHeightWithAspectRatio(
				newWidth,
				startShape.current.aspectRatio,
				startShape.current.scaleX,
				startShape.current.scaleY,
			);
		} else {
			newHeight = inversedLeftBottom.y - inversedDragPoint.y;
		}

		const inversedCenterX = inversedLeftBottom.x + nanToZero(newWidth / 2);
		const inversedCenterY = inversedLeftBottom.y - nanToZero(newHeight / 2);

		const center = affineTransformationOnDrag(inversedCenterX, inversedCenterY);

		triggerTransform(
			e.eventId,
			center,
			newWidth,
			newHeight,
			e.eventType,
			e.cursorX,
			e.cursorY,
		);
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
			setResizingByEvent,
			calcHeightWithAspectRatio,
		} = refBus.current;

		setResizingByEvent(e.eventType);

		if (e.eventType === "Start") {
			return triggerTransformStart(e.eventId);
		}

		const inversedDragPoint = inverseAffineTransformationOnDrag(e.endX, e.endY);
		const inversedLeftTop = inverseAffineTransformationOnDrag(
			startShape.current.leftTopPoint.x,
			startShape.current.leftTopPoint.y,
		);

		const newWidth = inversedDragPoint.x - inversedLeftTop.x;
		let newHeight: number;
		if (doKeepProportion && startShape.current.aspectRatio) {
			newHeight = calcHeightWithAspectRatio(
				newWidth,
				startShape.current.aspectRatio,
				startShape.current.scaleX,
				startShape.current.scaleY,
			);
		} else {
			newHeight = inversedDragPoint.y - inversedLeftTop.y;
		}

		const inversedCenterX = inversedLeftTop.x + nanToZero(newWidth / 2);
		const inversedCenterY = inversedLeftTop.y + nanToZero(newHeight / 2);

		const center = affineTransformationOnDrag(inversedCenterX, inversedCenterY);

		triggerTransform(
			e.eventId,
			center,
			newWidth,
			newHeight,
			e.eventType,
			e.cursorX,
			e.cursorY,
		);
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
			setResizingByEvent,
			calcWidthWithAspectRatio,
		} = refBus.current;

		setResizingByEvent(e.eventType);

		if (e.eventType === "Start") {
			return triggerTransformStart(e.eventId);
		}

		const inversedDragPoint = inverseAffineTransformationOnDrag(e.endX, e.endY);
		const inversedBottomCenter = inverseAffineTransformationOnDrag(
			startShape.current.bottomCenterPoint.x,
			startShape.current.bottomCenterPoint.y,
		);

		let newWidth: number;
		const newHeight = inversedBottomCenter.y - inversedDragPoint.y;
		if (doKeepProportion && startShape.current.aspectRatio) {
			newWidth = calcWidthWithAspectRatio(
				newHeight,
				startShape.current.aspectRatio,
				startShape.current.scaleX,
				startShape.current.scaleY,
			);
		} else {
			newWidth = startShape.current.width * startShape.current.scaleX;
		}

		const inversedCenterX = inversedBottomCenter.x;
		const inversedCenterY = inversedBottomCenter.y - nanToZero(newHeight / 2);

		const center = affineTransformationOnDrag(inversedCenterX, inversedCenterY);

		triggerTransform(
			e.eventId,
			center,
			newWidth,
			newHeight,
			e.eventType,
			e.cursorX,
			e.cursorY,
		);
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
			setResizingByEvent,
			calcHeightWithAspectRatio,
		} = refBus.current;

		setResizingByEvent(e.eventType);

		if (e.eventType === "Start") {
			return triggerTransformStart(e.eventId);
		}

		const inversedDragPoint = inverseAffineTransformationOnDrag(e.endX, e.endY);
		const inversedRightCenter = inverseAffineTransformationOnDrag(
			startShape.current.rightCenterPoint.x,
			startShape.current.rightCenterPoint.y,
		);

		const newWidth = inversedRightCenter.x - inversedDragPoint.x;
		let newHeight: number;
		if (doKeepProportion && startShape.current.aspectRatio) {
			newHeight = calcHeightWithAspectRatio(
				newWidth,
				startShape.current.aspectRatio,
				startShape.current.scaleX,
				startShape.current.scaleY,
			);
		} else {
			newHeight = startShape.current.height * startShape.current.scaleY;
		}

		const inversedCenterX = inversedRightCenter.x - nanToZero(newWidth / 2);
		const inversedCenterY = inversedRightCenter.y;

		const center = affineTransformationOnDrag(inversedCenterX, inversedCenterY);

		triggerTransform(
			e.eventId,
			center,
			newWidth,
			newHeight,
			e.eventType,
			e.cursorX,
			e.cursorY,
		);
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
			setResizingByEvent,
			calcHeightWithAspectRatio,
		} = refBus.current;

		setResizingByEvent(e.eventType);

		if (e.eventType === "Start") {
			return triggerTransformStart(e.eventId);
		}

		const inversedDragPoint = inverseAffineTransformationOnDrag(e.endX, e.endY);
		const inversedLeftCenter = inverseAffineTransformationOnDrag(
			startShape.current.leftCenterPoint.x,
			startShape.current.leftCenterPoint.y,
		);

		const newWidth = inversedDragPoint.x - inversedLeftCenter.x;
		let newHeight: number;
		if (doKeepProportion && startShape.current.aspectRatio) {
			newHeight = calcHeightWithAspectRatio(
				newWidth,
				startShape.current.aspectRatio,
				startShape.current.scaleX,
				startShape.current.scaleY,
			);
		} else {
			newHeight = startShape.current.height * startShape.current.scaleY;
		}

		const inversedCenterX = inversedLeftCenter.x + nanToZero(newWidth / 2);
		const inversedCenterY = inversedLeftCenter.y;

		const center = affineTransformationOnDrag(inversedCenterX, inversedCenterY);

		triggerTransform(
			e.eventId,
			center,
			newWidth,
			newHeight,
			e.eventType,
			e.cursorX,
			e.cursorY,
		);
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
			setResizingByEvent,
			calcWidthWithAspectRatio,
		} = refBus.current;

		setResizingByEvent(e.eventType);

		if (e.eventType === "Start") {
			return triggerTransformStart(e.eventId);
		}

		const inversedDragPoint = inverseAffineTransformationOnDrag(e.endX, e.endY);
		const inversedTopCenter = inverseAffineTransformationOnDrag(
			startShape.current.topCenterPoint.x,
			startShape.current.topCenterPoint.y,
		);

		let newWidth: number;
		const newHeight = inversedDragPoint.y - inversedTopCenter.y;
		if (doKeepProportion && startShape.current.aspectRatio) {
			newWidth = calcWidthWithAspectRatio(
				newHeight,
				startShape.current.aspectRatio,
				startShape.current.scaleX,
				startShape.current.scaleY,
			);
		} else {
			newWidth = startShape.current.width * startShape.current.scaleX;
		}

		const inversedCenterX = inversedTopCenter.x;
		const inversedCenterY = inversedTopCenter.y + nanToZero(newHeight / 2);

		const center = affineTransformationOnDrag(inversedCenterX, inversedCenterY);

		triggerTransform(
			e.eventId,
			center,
			newWidth,
			newHeight,
			e.eventType,
			e.cursorX,
			e.cursorY,
		);
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
			id,
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
			setIsRotating(true);
			return triggerTransformStart(e.eventId);
		}

		const radian = calcRadians(x, y, e.endX, e.endY);
		const rotatePointRadian = calcRadians(x, y, x + width, y - height);
		const newRotation =
			Math.round(radiansToDegrees(radian - rotatePointRadian) + 360) % 360;
		const event = {
			eventId: e.eventId,
			eventType: e.eventType,
			id,
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
			cursorX: e.cursorX ?? e.endX, // カーソル位置情報を追加
			cursorY: e.cursorY ?? e.endY, // カーソル位置情報を追加
		};

		onTransform?.(event);

		if (e.eventType === "End") setIsRotating(false);
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

	// Don't render if the component is not selected.
	if (!isSelected) {
		return null;
	}

	// Hide the transform outline when the component is the source of a multi-selection.
	if (isMultiSelectSource) {
		return null;
	}

	// Get the cursor for each drag point based on the rotation angle.
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
			{!isRotating && (
				<>
					{/* Top DragLine */}
					<DragLine
						id={`${id}-topCenter-line`}
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
					{/* Left DragLine */}
					<DragLine
						id={`${id}-leftCenter-line`}
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
					{/* Right DragLine */}
					<DragLine
						id={`${id}-rightCenter-line`}
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
					{/* Bottom DragLine */}
					<DragLine
						id={`${id}-bottomCenter-line`}
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
					{/* Left top DragPoint */}
					<DragPoint
						id={`${id}-leftTop`}
						x={vertices.leftTopPoint.x}
						y={vertices.leftTopPoint.y}
						cursor={cursors.leftTop}
						onDrag={handleDragLeftTop}
						dragPositioningFunction={
							doKeepProportion ? linerDragFunctionLeftTop : undefined
						}
					/>
					{/* Right bottom DragPoint */}
					<DragPoint
						id={`${id}-leftBottom`}
						x={vertices.leftBottomPoint.x}
						y={vertices.leftBottomPoint.y}
						cursor={cursors.leftBottom}
						onDrag={handleDragLeftBottom}
						dragPositioningFunction={
							doKeepProportion ? linerDragFunctionLeftBottom : undefined
						}
					/>
					{/* Right top DragPoint */}
					<DragPoint
						id={`${id}-rightTop`}
						x={vertices.rightTopPoint.x}
						y={vertices.rightTopPoint.y}
						cursor={cursors.rightTop}
						onDrag={handleDragRightTop}
						dragPositioningFunction={
							doKeepProportion ? linerDragFunctionRightTop : undefined
						}
					/>
					{/* Right bottom DragPoint */}
					<DragPoint
						id={`${id}-rightBottom`}
						x={vertices.rightBottomPoint.x}
						y={vertices.rightBottomPoint.y}
						cursor={cursors.rightBottom}
						onDrag={handleDragRightBottom}
						dragPositioningFunction={
							doKeepProportion ? linerDragFunctionRightBottom : undefined
						}
					/>
					{/* Top center DragPoint */}
					<DragPoint
						id={`${id}-topCenter`}
						x={vertices.topCenterPoint.x}
						y={vertices.topCenterPoint.y}
						cursor={cursors.topCenter}
						onDrag={handleDragTopCenter}
						dragPositioningFunction={linerDragFunctionTopCenter}
					/>
					{/* Left center DragPoint */}
					<DragPoint
						id={`${id}-leftCenter`}
						x={vertices.leftCenterPoint.x}
						y={vertices.leftCenterPoint.y}
						cursor={cursors.leftCenter}
						onDrag={handleDragLeftCenter}
						dragPositioningFunction={linerDragFunctionLeftCenter}
					/>
					{/* Right center DragPoint */}
					<DragPoint
						id={`${id}-rightCenter`}
						x={vertices.rightCenterPoint.x}
						y={vertices.rightCenterPoint.y}
						cursor={cursors.rightCenter}
						onDrag={handleDragRightCenter}
						dragPositioningFunction={linerDragFunctionRightCenter}
					/>
					{/* Bottom center DragPoint */}
					<DragPoint
						id={`${id}-bottomCenter`}
						x={vertices.bottomCenterPoint.x}
						y={vertices.bottomCenterPoint.y}
						cursor={cursors.bottomCenter}
						onDrag={handleDragBottomCenter}
						dragPositioningFunction={linerDragFunctionBottomCenter}
					/>
				</>
			)}
			{/* Rotate point. */}
			{!isResizing && (
				<RotatePoint
					id={`rotation-${id}`}
					x={rotationPoint.x}
					y={rotationPoint.y}
					rotation={rotation}
					onDrag={handleDragRotationPoint}
					dragPositioningFunction={dragFunctionRotationPoint}
				/>
			)}
			{/* Resizing label. */}
			{isResizing && (
				<BottomLabel
					x={x}
					y={y}
					width={width}
					height={height}
					rotation={rotation}
					scaleX={scaleX}
					scaleY={scaleY}
				>{`${Math.round(width)} x ${Math.round(height)}`}</BottomLabel>
			)}
		</>
	);
};

export const Transformative = memo(TransformativeComponent);
