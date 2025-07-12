// Import React.
import type React from "react";
import { memo, useCallback, useEffect, useRef, useState } from "react";

// Import types.
import type { DiagramDragEvent } from "../../../types/events/DiagramDragEvent";
import type { DiagramType } from "../../../types/base/DiagramType";
import type { EventType } from "../../../types/events/EventType";
import type { Point } from "../../../types/base/Point";
import type { SelectableData } from "../../../types/data/core/SelectableData";
import type { TransformativeData } from "../../../types/data/core/TransformativeData";
import type { TransformativeProps } from "../../../types/props/core/TransformativeProps";

// Import components.
import { BottomLabel } from "../BottomLabel";
import { DragLine } from "../DragLine";
import { DragPoint } from "../DragPoint";
import { RotatePoint } from "../RotatePoint";

// Import utils.
import { affineTransformation } from "../../../utils/math/transform/affineTransformation";
import { calcNearestCircleIntersectionPoint } from "../../../utils/math/points/calcNearestCircleIntersectionPoint";
import { calcRadians } from "../../../utils/math/points/calcRadians";
import { calcRectangleVertices } from "../../../utils/math/geometry/calcRectangleVertices";
import { createLinearX2yFunction } from "../../../utils/math/geometry/createLinearX2yFunction";
import { createLinearY2xFunction } from "../../../utils/math/geometry/createLinearY2xFunction";
import { degreesToRadians } from "../../../utils/math/common/degreesToRadians";
import { getCursorFromAngle } from "../../../utils/shapes/common/getCursorFromAngle";
import { inverseAffineTransformation } from "../../../utils/math/transform/inverseAffineTransformation";
import { nanToZero } from "../../../utils/math/common/nanToZero";
import { radiansToDegrees } from "../../../utils/math/common/radiansToDegrees";
import { signNonZero } from "../../../utils/math/common/signNonZero";

// Import local module files.
import { ROTATE_POINT_MARGIN } from "./TransformativeConstants";

/**
 * Props for the Transformative component.
 * Combines transformation data, selection state, and transformation event handlers.
 */
type Props = TransformativeData &
	SelectableData &
	TransformativeProps & {
		id: string;
		type: DiagramType;
	};

/**
 * Component that handles transformation of diagram elements.
 * Provides handles for resizing, rotating, and moving elements on the canvas.
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
	eventBus,
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

	const triggerTransformStart = (
		eventId: string,
		cursorX: number,
		cursorY: number,
	) => {
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
			cursorX,
			cursorY,
		});
	};

	const triggerTransform = (
		eventId: string,
		centerPoint: Point,
		newWidth: number,
		newHeight: number,
		eventType: EventType,
		cursorX: number,
		cursorY: number,
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
			cursorX,
			cursorY,
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
			return triggerTransformStart(e.eventId, e.cursorX, e.cursorY);
		}

		const inversedDragPoint = inverseAffineTransformationOnDrag(e.endX, e.endY);
		const inversedRightBottom = inverseAffineTransformationOnDrag(
			startShape.current.bottomRightPoint.x,
			startShape.current.bottomRightPoint.y,
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

	const linearDragFunctionLeftTop = useCallback(
		(x: number, y: number) =>
			createLinearY2xFunction(
				startShape.current.topLeftPoint,
				startShape.current.bottomRightPoint,
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
			return triggerTransformStart(e.eventId, e.cursorX, e.cursorY);
		}

		const inversedDragPoint = inverseAffineTransformationOnDrag(e.endX, e.endY);
		const inversedRightTop = inverseAffineTransformationOnDrag(
			startShape.current.topRightPoint.x,
			startShape.current.topRightPoint.y,
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

	const linearDragFunctionLeftBottom = useCallback(
		(x: number, y: number) =>
			createLinearY2xFunction(
				startShape.current.topRightPoint,
				startShape.current.bottomLeftPoint,
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
			return triggerTransformStart(e.eventId, e.cursorX, e.cursorY);
		}

		const inversedDragPoint = inverseAffineTransformationOnDrag(e.endX, e.endY);
		const inversedLeftBottom = inverseAffineTransformationOnDrag(
			startShape.current.bottomLeftPoint.x,
			startShape.current.bottomLeftPoint.y,
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

	const linearDragFunctionRightTop = useCallback(
		(x: number, y: number) =>
			createLinearY2xFunction(
				startShape.current.topRightPoint,
				startShape.current.bottomLeftPoint,
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
			return triggerTransformStart(e.eventId, e.cursorX, e.cursorY);
		}

		const inversedDragPoint = inverseAffineTransformationOnDrag(e.endX, e.endY);
		const inversedLeftTop = inverseAffineTransformationOnDrag(
			startShape.current.topLeftPoint.x,
			startShape.current.topLeftPoint.y,
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

	const linearDragFunctionRightBottom = useCallback(
		(x: number, y: number) =>
			createLinearY2xFunction(
				startShape.current.bottomRightPoint,
				startShape.current.topLeftPoint,
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
			return triggerTransformStart(e.eventId, e.cursorX, e.cursorY);
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

	const linearDragFunctionTopCenter = useCallback(
		(x: number, y: number) =>
			!refBus.current.isSwapped
				? createLinearY2xFunction(
						startShape.current.bottomCenterPoint,
						startShape.current.topCenterPoint,
					)(x, y)
				: createLinearX2yFunction(
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
			return triggerTransformStart(e.eventId, e.cursorX, e.cursorY);
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

	const linearDragFunctionLeftCenter = useCallback(
		(x: number, y: number) =>
			!refBus.current.isSwapped
				? createLinearX2yFunction(
						startShape.current.leftCenterPoint,
						startShape.current.rightCenterPoint,
					)(x, y)
				: createLinearY2xFunction(
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
			return triggerTransformStart(e.eventId, e.cursorX, e.cursorY);
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

	const linearDragFunctionRightCenter = useCallback(
		(x: number, y: number) =>
			!refBus.current.isSwapped
				? createLinearX2yFunction(
						startShape.current.leftCenterPoint,
						startShape.current.rightCenterPoint,
					)(x, y)
				: createLinearY2xFunction(
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
			return triggerTransformStart(e.eventId, e.cursorX, e.cursorY);
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

	const linearDragFunctionBottomCenter = useCallback(
		(x: number, y: number) =>
			!refBus.current.isSwapped
				? createLinearY2xFunction(
						startShape.current.bottomCenterPoint,
						startShape.current.topCenterPoint,
					)(x, y)
				: createLinearX2yFunction(
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
			return triggerTransformStart(e.eventId, e.cursorX, e.cursorY);
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
			cursorX: e.cursorX,
			cursorY: e.cursorY,
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
			{!isRotating && (
				<>
					{/* Top DragLine */}
					<DragLine
						id={`${id}-topCenter-line`}
						x={vertices.topCenterPoint.x}
						y={vertices.topCenterPoint.y}
						startX={vertices.topLeftPoint.x}
						startY={vertices.topLeftPoint.y}
						endX={vertices.topRightPoint.x}
						endY={vertices.topRightPoint.y}
						cursor={cursors.topCenter}
						eventBus={eventBus}
						onDrag={handleDragTopCenter}
						dragPositioningFunction={linearDragFunctionTopCenter}
					/>
					{/* Left DragLine */}
					<DragLine
						id={`${id}-leftCenter-line`}
						x={vertices.leftCenterPoint.x}
						y={vertices.leftCenterPoint.y}
						startX={vertices.topLeftPoint.x}
						startY={vertices.topLeftPoint.y}
						endX={vertices.bottomLeftPoint.x}
						endY={vertices.bottomLeftPoint.y}
						cursor={cursors.leftCenter}
						eventBus={eventBus}
						onDrag={handleDragLeftCenter}
						dragPositioningFunction={linearDragFunctionLeftCenter}
					/>
					{/* Right DragLine */}
					<DragLine
						id={`${id}-rightCenter-line`}
						x={vertices.rightCenterPoint.x}
						y={vertices.rightCenterPoint.y}
						startX={vertices.topRightPoint.x}
						startY={vertices.topRightPoint.y}
						endX={vertices.bottomRightPoint.x}
						endY={vertices.bottomRightPoint.y}
						cursor={cursors.rightCenter}
						eventBus={eventBus}
						onDrag={handleDragRightCenter}
						dragPositioningFunction={linearDragFunctionRightCenter}
					/>
					{/* Bottom DragLine */}
					<DragLine
						id={`${id}-bottomCenter-line`}
						x={vertices.bottomCenterPoint.x}
						y={vertices.bottomCenterPoint.y}
						startX={vertices.bottomLeftPoint.x}
						startY={vertices.bottomLeftPoint.y}
						endX={vertices.bottomRightPoint.x}
						endY={vertices.bottomRightPoint.y}
						cursor={cursors.bottomCenter}
						eventBus={eventBus}
						onDrag={handleDragBottomCenter}
						dragPositioningFunction={linearDragFunctionBottomCenter}
					/>
					{/* Top left DragPoint */}
					<DragPoint
						id={`${id}-topLeft`}
						x={vertices.topLeftPoint.x}
						y={vertices.topLeftPoint.y}
						cursor={cursors.leftTop}
						eventBus={eventBus}
						onDrag={handleDragLeftTop}
						dragPositioningFunction={
							doKeepProportion ? linearDragFunctionLeftTop : undefined
						}
					/>
					{/* Bottom left DragPoint */}
					<DragPoint
						id={`${id}-bottomLeft`}
						x={vertices.bottomLeftPoint.x}
						y={vertices.bottomLeftPoint.y}
						cursor={cursors.leftBottom}
						eventBus={eventBus}
						onDrag={handleDragLeftBottom}
						dragPositioningFunction={
							doKeepProportion ? linearDragFunctionLeftBottom : undefined
						}
					/>
					{/* Top right DragPoint */}
					<DragPoint
						id={`${id}-topRight`}
						x={vertices.topRightPoint.x}
						y={vertices.topRightPoint.y}
						cursor={cursors.rightTop}
						eventBus={eventBus}
						onDrag={handleDragRightTop}
						dragPositioningFunction={
							doKeepProportion ? linearDragFunctionRightTop : undefined
						}
					/>
					{/* Bottom right DragPoint */}
					<DragPoint
						id={`${id}-bottomRight`}
						x={vertices.bottomRightPoint.x}
						y={vertices.bottomRightPoint.y}
						cursor={cursors.rightBottom}
						eventBus={eventBus}
						onDrag={handleDragRightBottom}
						dragPositioningFunction={
							doKeepProportion ? linearDragFunctionRightBottom : undefined
						}
					/>
					{/* Top center DragPoint */}
					<DragPoint
						id={`${id}-topCenter`}
						x={vertices.topCenterPoint.x}
						y={vertices.topCenterPoint.y}
						cursor={cursors.topCenter}
						eventBus={eventBus}
						onDrag={handleDragTopCenter}
						dragPositioningFunction={linearDragFunctionTopCenter}
					/>
					{/* Left center DragPoint */}
					<DragPoint
						id={`${id}-leftCenter`}
						x={vertices.leftCenterPoint.x}
						y={vertices.leftCenterPoint.y}
						cursor={cursors.leftCenter}
						eventBus={eventBus}
						onDrag={handleDragLeftCenter}
						dragPositioningFunction={linearDragFunctionLeftCenter}
					/>
					{/* Right center DragPoint */}
					<DragPoint
						id={`${id}-rightCenter`}
						x={vertices.rightCenterPoint.x}
						y={vertices.rightCenterPoint.y}
						cursor={cursors.rightCenter}
						eventBus={eventBus}
						onDrag={handleDragRightCenter}
						dragPositioningFunction={linearDragFunctionRightCenter}
					/>
					{/* Bottom center DragPoint */}
					<DragPoint
						id={`${id}-bottomCenter`}
						x={vertices.bottomCenterPoint.x}
						y={vertices.bottomCenterPoint.y}
						cursor={cursors.bottomCenter}
						eventBus={eventBus}
						onDrag={handleDragBottomCenter}
						dragPositioningFunction={linearDragFunctionBottomCenter}
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
					eventBus={eventBus}
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
