// Import React.
import type React from "react";
import { memo, useCallback, useRef, useState } from "react";

// Import types.
import type { PathPointData } from "../../../../types/data/shapes/PathPointData";
import type { DiagramChangeEvent } from "../../../../types/events/DiagramChangeEvent";
import type { DiagramClickEvent } from "../../../../types/events/DiagramClickEvent";
import type { DiagramDragEvent } from "../../../../types/events/DiagramDragEvent";
import type { DiagramPointerEvent } from "../../../../types/events/DiagramPointerEvent";
import type { Diagram } from "../../../../types/state/catalog/Diagram";

// Import utils.
import { newId } from "../../../../utils/shapes/common/newId";

// Imports related to this component.
import { Segment, type SegmentData } from "../Segment";

/**
 * Segment list properties
 */
type SegmentListProps = {
	id: string;
	rightAngleSegmentDrag: boolean;
	fixBothEnds: boolean;
	items: Diagram[];
	onPointerDown?: (e: DiagramPointerEvent) => void;
	onClick?: (e: DiagramClickEvent) => void;
	onDiagramChange?: (e: DiagramChangeEvent) => void;
};

/**
 * Segment list component
 */
const SegmentListComponent: React.FC<SegmentListProps> = ({
	id,
	rightAngleSegmentDrag,
	fixBothEnds,
	items,
	onClick,
	onDiagramChange,
}) => {
	const [draggingSegment, setDraggingSegment] = useState<
		SegmentData | undefined
	>();
	const startSegment = useRef<SegmentData>(undefined);

	// Items of owner Path component at the start of the segment drag.
	const startItems = useRef<Diagram[]>(items);

	const segmentList: SegmentData[] = [];
	if (draggingSegment) {
		segmentList.push(draggingSegment);
	} else {
		for (let i = 0; i < items.length - 1; i++) {
			const item = items[i];
			const nextItem = items[i + 1];

			segmentList.push({
				id: `${item.id}-${nextItem.id}`,
				startX: item.x,
				startY: item.y,
				startPointId: item.id,
				endX: nextItem.x,
				endY: nextItem.y,
				endPointId: nextItem.id,
			});
		}
	}

	// Create references bypass to avoid function creation in every render.
	const refBusVal = {
		// Component properties
		id,
		items,
		fixBothEnds,
		onDiagramChange,
		// Internal variables and functions
		draggingSegment,
		segmentList,
	};
	const refBus = useRef(refBusVal);
	refBus.current = refBusVal;

	/**
	 * Handle segment drag event.
	 */
	const handleSegmentDrag = useCallback((e: DiagramDragEvent) => {
		// Bypass references to avoid function creation in every render.
		const {
			id,
			fixBothEnds,
			items,
			onDiagramChange,
			draggingSegment,
			segmentList,
		} = refBus.current;

		// Process the drag start event.
		if (e.eventPhase === "Started") {
			// Store the items at the start of the segment drag.
			startItems.current = items;

			// Find the index of the segment being dragged.
			const idx = segmentList.findIndex((v) => v.id === e.id);

			// Store segment data at the start of the segment drag.
			const segment = segmentList[idx];
			startSegment.current = segment;

			// Prepare a new segment data.
			const newSegment = {
				...segment,
			};

			if (fixBothEnds && (idx === 0 || idx === segmentList.length - 1)) {
				// If both ends are fixed, add a new vertex when moving both ends of the segment.
				const newItems = [...items];

				if (idx === segmentList.length - 1) {
					const newItem = {
						id: newId(),
						type: "PathPoint",
						x: segment.endX,
						y: segment.endY,
					} as PathPointData;
					newItems.splice(newItems.length - 1, 0, newItem);
					newSegment.endPointId = newItem.id;
				}

				if (idx === 0) {
					const newItem = {
						id: newId(),
						type: "PathPoint",
						x: segment.startX,
						y: segment.startY,
					} as PathPointData;
					newItems.splice(1, 0, newItem);
					newSegment.startPointId = newItem.id;
				}

				onDiagramChange?.({
					eventId: e.eventId,
					eventPhase: e.eventPhase,
					id,
					startDiagram: {
						items: startItems.current,
					},
					endDiagram: {
						items: newItems,
					},
				});
			}

			setDraggingSegment(newSegment);
		}

		if (!draggingSegment || !startSegment.current) {
			return;
		}

		const dx = e.endX - e.startX;
		const dy = e.endY - e.startY;
		const newStartX = startSegment.current.startX + dx;
		const newStartY = startSegment.current.startY + dy;
		const newEndX = startSegment.current.endX + dx;
		const newEndY = startSegment.current.endY + dy;

		if (e.eventPhase === "InProgress") {
			setDraggingSegment({
				...draggingSegment,
				startX: newStartX,
				startY: newStartY,
				endX: newEndX,
				endY: newEndY,
			});

			onDiagramChange?.({
				eventId: e.eventId,
				eventPhase: e.eventPhase,
				id,
				startDiagram: {
					items: startItems.current,
				},
				endDiagram: {
					items: items.map((item) => {
						if (item.id === draggingSegment.startPointId) {
							return { ...item, x: newStartX, y: newStartY };
						}
						if (item.id === draggingSegment.endPointId) {
							return { ...item, x: newEndX, y: newEndY };
						}
						return item;
					}),
				},
			});
		}

		if (e.eventPhase === "Ended") {
			onDiagramChange?.({
				eventId: e.eventId,
				eventPhase: e.eventPhase,
				id,
				startDiagram: {
					items: startItems.current,
				},
				endDiagram: {
					items: items.map((item) => {
						// When dragging is complete, change from temporary ID to new ID
						if (item.id === draggingSegment.startPointId) {
							return { ...item, x: newStartX, y: newStartY };
						}
						if (item.id === draggingSegment.endPointId) {
							return { ...item, x: newEndX, y: newEndY };
						}
						return item;
					}),
				},
			});
			setDraggingSegment(undefined);
		}
	}, []);

	return segmentList.map((item) => (
		<Segment
			key={item.id}
			{...item}
			rightAngleSegmentDrag={rightAngleSegmentDrag}
			onClick={onClick}
			onDrag={handleSegmentDrag}
		/>
	));
};

export const SegmentList = memo(SegmentListComponent);
