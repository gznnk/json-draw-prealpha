// Import React.
import type React from "react";
import { memo, useCallback, useEffect, useRef, useState } from "react";

// Import types.
import type { DiagramType } from "../../../types/core/DiagramType";
import type { Point } from "../../../types/core/Point";
import type { TransformationType } from "../../../types/core/TransformationType";
import type { DiagramDragEvent } from "../../../types/events/DiagramDragEvent";
import type { DiagramClickEvent } from "../../../types/events/DiagramClickEvent";
import type { EventPhase } from "../../../types/events/EventPhase";
import type { TransformativeProps } from "../../../types/props/core/TransformativeProps";
import type { TransformativeState } from "../../../types/state/core/TransformativeState";

// Import components.
import { BottomLabel } from "../BottomLabel";
import { DragLine } from "../DragLine";
import { DragPoint } from "../DragPoint";
import { RotatePoint } from "../RotatePoint";

// Import utils.
import { degreesToRadians } from "../../../utils/math/common/degreesToRadians";
import { nanToZero } from "../../../utils/math/common/nanToZero";
import { radiansToDegrees } from "../../../utils/math/common/radiansToDegrees";
import { signNonZero } from "../../../utils/math/common/signNonZero";
import { calcRectangleVertices } from "../../../utils/math/geometry/calcRectangleVertices";
import { createLinearX2yFunction } from "../../../utils/math/geometry/createLinearX2yFunction";
import { createLinearY2xFunction } from "../../../utils/math/geometry/createLinearY2xFunction";
import { calcClosestCircleIntersection } from "../../../utils/math/points/calcClosestCircleIntersection";
import { calcRadians } from "../../../utils/math/points/calcRadians";
import { affineTransformation } from "../../../utils/math/transform/affineTransformation";
import { inverseAffineTransformation } from "../../../utils/math/transform/inverseAffineTransformation";
import { getCursorFromAngle } from "../../../utils/shapes/common/getCursorFromAngle";

// Import local module files.
import { ROTATE_POINT_MARGIN } from "./TransformativeConstants";

/**
 * Props for the Transformative component.
 * Combines transformation data, selection state, and transformation event handlers.
 */
type Props = TransformativeState &
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
	showTransformControls,
	onTransform,
	onClick,
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

	const triggerTransformStart = (e: DiagramDragEvent) => {
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
			eventId: e.eventId,
			eventPhase: "Started",
			transformationType: "Resize",
			id,
			startShape: startShape.current,
			endShape: startShape.current,
			cursorX: e.cursorX,
			cursorY: e.cursorY,
			clientX: e.clientX,
			clientY: e.clientY,
			minX: e.minX,
			minY: e.minY,
		});
	};

	const triggerTransform = (
		e: DiagramDragEvent,
		centerPoint: Point,
		newWidth: number,
		newHeight: number,
	) => {
		const event = {
			eventId: e.eventId,
			eventPhase: e.eventPhase,
			transformationType: "Resize" as TransformationType,
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
			cursorX: e.cursorX,
			cursorY: e.cursorY,
			clientX: e.clientX,
			clientY: e.clientY,
			minX: e.minX,
			minY: e.minY,
		};

		onTransform?.(event);
	};

	const setResizingByEvent = (eventPhase: EventPhase) => {
		if (eventPhase === "Started") {
			setIsResizing(true);
		} else if (eventPhase === "Ended") {
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

		setResizingByEvent(e.eventPhase);

		if (e.eventPhase === "Started") {
			return triggerTransformStart(e);
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

		// Pass cursor position to enable auto-scrolling
		triggerTransform(e, center, newWidth, newHeight);
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

		setResizingByEvent(e.eventPhase);

		if (e.eventPhase === "Started") {
			return triggerTransformStart(e);
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

		triggerTransform(e, center, newWidth, newHeight);
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

		setResizingByEvent(e.eventPhase);

		if (e.eventPhase === "Started") {
			return triggerTransformStart(e);
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

		triggerTransform(e, center, newWidth, newHeight);
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

		setResizingByEvent(e.eventPhase);

		if (e.eventPhase === "Started") {
			return triggerTransformStart(e);
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

		triggerTransform(e, center, newWidth, newHeight);
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

		setResizingByEvent(e.eventPhase);

		if (e.eventPhase === "Started") {
			return triggerTransformStart(e);
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

		triggerTransform(e, center, newWidth, newHeight);
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
					)(x),
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

		setResizingByEvent(e.eventPhase);

		if (e.eventPhase === "Started") {
			return triggerTransformStart(e);
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

		triggerTransform(e, center, newWidth, newHeight);
	}, []);

	const linearDragFunctionLeftCenter = useCallback(
		(x: number, y: number) =>
			!refBus.current.isSwapped
				? createLinearX2yFunction(
						startShape.current.leftCenterPoint,
						startShape.current.rightCenterPoint,
					)(x)
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

		setResizingByEvent(e.eventPhase);

		if (e.eventPhase === "Started") {
			return triggerTransformStart(e);
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

		triggerTransform(e, center, newWidth, newHeight);
	}, []);

	const linearDragFunctionRightCenter = useCallback(
		(x: number, y: number) =>
			!refBus.current.isSwapped
				? createLinearX2yFunction(
						startShape.current.leftCenterPoint,
						startShape.current.rightCenterPoint,
					)(x)
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

		setResizingByEvent(e.eventPhase);

		if (e.eventPhase === "Started") {
			return triggerTransformStart(e);
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

		triggerTransform(e, center, newWidth, newHeight);
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
					)(x),
		[],
	);
	// --- BottomCenter End --- //

	// Monitor shift key state
	useEffect(() => {
		let handleKeyDown: (e: KeyboardEvent) => void;
		let handleKeyUp: (e: KeyboardEvent) => void;
		if (showTransformControls) {
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
			// Cleanup
			if (showTransformControls) {
				window.removeEventListener("keydown", handleKeyDown);
				window.removeEventListener("keyup", handleKeyUp);
			}
		};
	}, [showTransformControls]);

	// Rotation
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
	 * Rotation point drag handler
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
			rotation,
			vertices,
		} = refBus.current;

		if (e.eventPhase === "Started") {
			setIsRotating(true);

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
				eventId: e.eventId,
				eventPhase: "Started",
				transformationType: "Rotation",
				id,
				startShape: startShape.current,
				endShape: startShape.current,
				cursorX: e.cursorX,
				cursorY: e.cursorY,
				clientX: e.clientX,
				clientY: e.clientY,
				minX: e.minX,
				minY: e.minY,
			});

			return;
		}

		const radian = calcRadians(x, y, e.endX, e.endY);
		const rotatePointRadian = calcRadians(x, y, x + width, y - height);
		const newRotation =
			Math.round(radiansToDegrees(radian - rotatePointRadian) + 360) % 360;
		const event = {
			eventId: e.eventId,
			eventPhase: e.eventPhase,
			transformationType: "Rotation" as TransformationType,
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
			clientX: e.clientX,
			clientY: e.clientY,
		};

		onTransform?.(event);

		if (e.eventPhase === "Ended") setIsRotating(false);
	}, []);

	const dragFunctionRotationPoint = useCallback((rx: number, ry: number) => {
		const { x, y, width } = refBus.current;

		return calcClosestCircleIntersection(
			x,
			y,
			width / 2 + ROTATE_POINT_MARGIN,
			rx,
			ry,
		);
	}, []);

	/**
	 * Handle click events from drag lines and points.
	 * Forwards the click event with the correct id to the parent component.
	 */
	const handleClick = useCallback(
		(e: DiagramClickEvent) => {
			if (onClick) {
				onClick({
					...e,
					id,
				});
			}
		},
		[id, onClick],
	);

	// Don't render if the component is not selected.
	if (!showTransformControls) {
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
						onDrag={handleDragTopCenter}
						onClick={handleClick}
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
						onDrag={handleDragLeftCenter}
						onClick={handleClick}
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
						onDrag={handleDragRightCenter}
						onClick={handleClick}
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
						onDrag={handleDragBottomCenter}
						onClick={handleClick}
						dragPositioningFunction={linearDragFunctionBottomCenter}
					/>
					{/* Top left DragPoint */}
					<DragPoint
						id={`${id}-topLeft`}
						x={vertices.topLeftPoint.x}
						y={vertices.topLeftPoint.y}
						cursor={cursors.leftTop}
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
						onDrag={handleDragTopCenter}
						dragPositioningFunction={linearDragFunctionTopCenter}
					/>
					{/* Left center DragPoint */}
					<DragPoint
						id={`${id}-leftCenter`}
						x={vertices.leftCenterPoint.x}
						y={vertices.leftCenterPoint.y}
						cursor={cursors.leftCenter}
						onDrag={handleDragLeftCenter}
						dragPositioningFunction={linearDragFunctionLeftCenter}
					/>
					{/* Right center DragPoint */}
					<DragPoint
						id={`${id}-rightCenter`}
						x={vertices.rightCenterPoint.x}
						y={vertices.rightCenterPoint.y}
						cursor={cursors.rightCenter}
						onDrag={handleDragRightCenter}
						dragPositioningFunction={linearDragFunctionRightCenter}
					/>
					{/* Bottom center DragPoint */}
					<DragPoint
						id={`${id}-bottomCenter`}
						x={vertices.bottomCenterPoint.x}
						y={vertices.bottomCenterPoint.y}
						cursor={cursors.bottomCenter}
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
