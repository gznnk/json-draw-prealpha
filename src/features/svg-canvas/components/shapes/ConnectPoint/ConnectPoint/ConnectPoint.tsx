// Import React.
import type React from "react";
import { memo, useCallback, useEffect, useRef, useState } from "react";

// Import types.
import type { Point } from "../../../../types/base/Point";
import type { DiagramDragDropEvent } from "../../../../types/events/DiagramDragDropEvent";
import type { DiagramDragEvent } from "../../../../types/events/DiagramDragEvent";
import type { DiagramHoverChangeEvent } from "../../../../types/events/DiagramHoverChangeEvent";
import type { ConnectPointProps } from "../../../../types/props/shapes/ConnectPointProps";
import type { PathPointData } from "../../../../types/data/shapes/PathPointData";

// Import hooks
import { useEventBus } from "../../../../context/EventBusContext";

// Import components related to SvgCanvas
import { DragPoint } from "../../../core/DragPoint";

// Import utils.
import { calcRectangleBoundingBoxGeometry } from "../../../../utils/math/geometry/calcRectangleBoundingBoxGeometry";
import { newId } from "../../../../utils/shapes/common/newId";

// Imports related to this component.
import { triggerNewConnectLine } from "../NewConnectLine";
import { EVENT_NAME_CONNECTTION } from "./ConnectPointConstants";
import { generateOptimalShapeToShapeConnection } from "../../../../utils/shapes/connectPoint/generateOptimalShapeToShapeConnection";
import { generatePathFromShapeToPoint } from "../../../../utils/shapes/connectPoint/generatePathFromShapeToPoint";
import { getLineDirection } from "../../../../utils/shapes/connectPoint/getLineDirection";
import type { ConnectingPoint, ConnectionEvent } from "./ConnectPointTypes";

/**
 * Connect point component
 */
const ConnectPointComponent: React.FC<ConnectPointProps> = ({
	id,
	x,
	y,
	ownerId,
	ownerShape,
	isTransparent,
	onConnect,
}) => {
	// Get eventBus from context
	const eventBus = useEventBus();

	// Hover state management
	const [isHovered, setIsHovered] = useState(false);
	// Connection line coordinates
	const [pathPoints, setPathPoints] = useState<PathPointData[]>([]);
	// Connecting point
	const connectingPoint = useRef<ConnectingPoint | undefined>(undefined);
	// Bounding box geometry of the connect point's owner
	const ownerBoundingBoxGeometry = calcRectangleBoundingBoxGeometry(ownerShape);
	// Direction of the connect point
	const direction = getLineDirection(ownerShape.x, ownerShape.y, x, y);

	/**
	 * Update connection line coordinates
	 */
	const updatePathPoints = (dragX: number, dragY: number) => {
		let newPoints: Point[] = [];

		if (!connectingPoint.current) {
			// Connection line during dragging
			newPoints = generatePathFromShapeToPoint(
				x,
				y,
				direction,
				ownerBoundingBoxGeometry,
				dragX,
				dragY,
			);
		} else {
			// Connection line when there is a connecting point
			newPoints = generateOptimalShapeToShapeConnection(
				x,
				y,
				ownerShape,
				connectingPoint.current.x, // X coordinate of the connection destination
				connectingPoint.current.y, // Y coordinate of the connection destination
				connectingPoint.current.ownerShape, // Shape of the connection destination's owner
			);
		}

		const newPathPoints = newPoints.map(
			(p, i) =>
				({
					id: `${id}-${i}`, // Assign temporary ID
					x: p.x,
					y: p.y,
				}) as PathPointData,
		);

		setPathPoints(newPathPoints);

		// Notify the path data for the new connection line rendering.
		triggerNewConnectLine(eventBus, {
			id: `${id}-connecting-path`,
			type: "Path",
			x: 0,
			y: 0,
			width: 0,
			height: 0,
			rotation: 0,
			scaleX: 1,
			scaleY: 1,
			stroke: "#3A415C",
			strokeWidth: "3px",
			keepProportion: false,
			isSelected: false,
			showTransformControls: false,
			showOutline: false,
			isTransforming: false,
			endArrowHead: "Circle",
			items: newPathPoints,
		});
	};

	// To avoid frequent handler generation, hold referenced values in useRef
	const refBusVal = {
		// Properties
		id,
		x,
		y,
		ownerId,
		ownerShape,
		onConnect,
		eventBus,
		// Internal variables and functions
		pathPoints,
		updatePathPoints,
	};
	const refBus = useRef(refBusVal);
	refBus.current = refBusVal;

	/**
	 * Drag event handler for the connect point
	 */
	const handleDrag = useCallback((e: DiagramDragEvent) => {
		if (connectingPoint.current) {
			// If there is a connecting point, use that point as the end point
			return;
		}

		// Recalculate connection line coordinates
		refBus.current.updatePathPoints(e.endX, e.endY);

		if (e.eventType === "End") {
			setPathPoints([]);

			// Clear the path data for the new connection line rendering.
			triggerNewConnectLine(refBus.current.eventBus);
		}
	}, []);

	/**
	 * Event handler when an element is dragged over this connect point
	 */
	const handleDragOver = useCallback((e: DiagramDragDropEvent) => {
		if (e.dropItem.type === "ConnectPoint") {
			setIsHovered(true);

			const { id, x, y, ownerId, ownerShape, eventBus } = refBus.current;

			// Send notification to the connection destination
			eventBus.dispatchEvent(
				new CustomEvent(EVENT_NAME_CONNECTTION, {
					detail: {
						eventId: e.eventId,
						type: "connecting",
						startPointId: e.dropItem.id,
						startX: e.dropItem.x,
						startY: e.dropItem.y,
						endPointId: id,
						endX: x,
						endY: y,
						endOwnerId: ownerId,
						endOwnerShape: ownerShape,
					},
				}),
			);
		}
	}, []);

	/**
	 * Event handler when an element is dragged away from this connect point
	 */
	const handleDragLeave = useCallback((e: DiagramDragDropEvent) => {
		setIsHovered(false);
		// Processing when connection is cancelled
		if (e.dropItem.type === "ConnectPoint") {
			const { id, x, y, ownerId, ownerShape, eventBus } = refBus.current;

			// Send notification to the connection destination
			eventBus.dispatchEvent(
				new CustomEvent(EVENT_NAME_CONNECTTION, {
					detail: {
						eventId: e.eventId,
						type: "disconnect",
						startPointId: e.dropItem.id,
						startX: e.dropItem.x,
						startY: e.dropItem.y,
						endPointId: id,
						endX: x,
						endY: y,
						endOwnerId: ownerId,
						endOwnerShape: ownerShape,
					},
				}),
			);
		}
	}, []);

	/**
	 * Event handler when an element is dropped on this connect point
	 */
	const handleDrop = useCallback((e: DiagramDragDropEvent) => {
		// Processing when dropped
		if (e.dropItem.type === "ConnectPoint") {
			const { id, x, y, ownerId, ownerShape, eventBus } = refBus.current;

			// Send notification to the connection destination
			eventBus.dispatchEvent(
				new CustomEvent(EVENT_NAME_CONNECTTION, {
					detail: {
						eventId: e.eventId,
						type: "connect",
						startPointId: e.dropItem.id,
						startX: e.dropItem.x,
						startY: e.dropItem.y,
						endPointId: id,
						endX: x,
						endY: y,
						endOwnerId: ownerId,
						endOwnerShape: ownerShape,
					},
				}),
			);
		}
		setIsHovered(false);
	}, []);

	/**
	 * Hover state change event handler
	 *
	 * @param {DiagramHoverChangeEvent} e Hover state change event
	 * @returns {void}
	 */
	const handleHover = useCallback((e: DiagramHoverChangeEvent) => {
		setIsHovered(e.isHovered);
	}, []);

	useEffect(() => {
		const handleConnection = (e: Event) => {
			// Get referenced values via refBus
			const { id, pathPoints, ownerId, onConnect, updatePathPoints, eventBus } =
				refBus.current;

			const customEvent = e as CustomEvent<ConnectionEvent>;
			if (customEvent.detail.startPointId === id) {
				if (customEvent.detail.type === "connecting") {
					// Processing when connection starts
					// Hold the connection destination point
					connectingPoint.current = {
						id: customEvent.detail.endPointId,
						x: customEvent.detail.endX,
						y: customEvent.detail.endY,
						onwerId: customEvent.detail.endOwnerId,
						ownerShape: customEvent.detail.endOwnerShape,
					};

					// Recalculate path points so that the line connects to the connection destination point
					updatePathPoints(customEvent.detail.endX, customEvent.detail.endY);
				}

				if (customEvent.detail.type === "disconnect") {
					// Processing during disconnection
					// Release the connecting point
					connectingPoint.current = undefined;
				}

				if (customEvent.detail.type === "connect") {
					// Processing when connection is completed
					// Generate connection line data and fire event

					const points: PathPointData[] = [...pathPoints];
					points[0].id = id;
					for (let i = 1; i < points.length - 1; i++) {
						points[i].id = newId();
					}
					points[points.length - 1].id = customEvent.detail.endPointId;

					onConnect?.({
						eventId: customEvent.detail.eventId,
						startOwnerId: ownerId,
						points: points,
						endOwnerId: customEvent.detail.endOwnerId,
					});

					setPathPoints([]);

					// Clear the path data for the new connection line rendering.
					triggerNewConnectLine(eventBus);
				}
			}
		};

		eventBus.addEventListener(EVENT_NAME_CONNECTTION, handleConnection);

		return () => {
			if (handleConnection) {
				eventBus.removeEventListener(EVENT_NAME_CONNECTTION, handleConnection);
			}
		};
	}, [eventBus]);

	return (
		<DragPoint
			id={id}
			x={x}
			y={y}
			type="ConnectPoint"
			radius={6}
			stroke="rgba(255, 204, 0, 0.8)"
			fill="rgba(255, 204, 0, 0.8)"
			cursor="pointer"
			outline="none"
			// Show when hovered, even if isTransparent is true.
			// If you want to hide when hovered, do not render this component.
			isTransparent={isTransparent && !isHovered}
			onDrag={handleDrag}
			onDragOver={handleDragOver}
			onDragLeave={handleDragLeave}
			onDrop={handleDrop}
			onHoverChange={handleHover}
		/>
	);
};

export const ConnectPoint = memo(ConnectPointComponent);
