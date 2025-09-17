// Import React.
import type React from "react";
import { memo, useCallback, useRef, useState } from "react";

// Import types.
import type { DiagramChangeEvent } from "../../../../types/events/DiagramChangeEvent";
import type { DiagramDragEvent } from "../../../../types/events/DiagramDragEvent";
import type { Diagram } from "../../../../types/state/core/Diagram";
import type { PathState } from "../../../../types/state/shapes/PathState";

// Import utils.
import { newId } from "../../../../utils/shapes/common/newId";

// Import local modules.
import { NewVertex, type NewVertexData } from "../NewVertex";

/**
 * New vertex list properties
 */
type NewVertexListProps = {
	id: string;
	items: Diagram[];
	onDiagramChange?: (e: DiagramChangeEvent) => void;
};

/**
 * New vertex list component
 */
const NewVertexListComponent: React.FC<NewVertexListProps> = ({
	id,
	items,
	onDiagramChange,
}) => {
	// Dragging NewVertex component data.
	const [draggingNewVertex, setDraggingNewVertex] = useState<
		NewVertexData | undefined
	>();

	// Items of owner Path component at the start of the new vertex drag.
	const startItems = useRef<Diagram[]>(items);

	// NewVertex data list for rendering.
	const newVertexList: NewVertexData[] = [];
	if (draggingNewVertex) {
		// During dragging, render only that new vertex
		newVertexList.push(draggingNewVertex);
	} else {
		// When not dragging, render new vertices at the midpoint of each vertex pair
		for (let i = 0; i < items.length - 1; i++) {
			const item = items[i];
			const nextItem = items[i + 1];

			const x = (item.x + nextItem.x) / 2;
			const y = (item.y + nextItem.y) / 2;

			newVertexList.push({
				id: `${item.id}-${nextItem.id}`, // Generate ID from adjacent vertices
				x,
				y,
			});
		}
	}

	// Use ref to hold referenced values to avoid frequent handler generation
	const refBusVal = {
		// Properties
		id,
		items,
		onDiagramChange,
		// State variables and functions
		newVertexList,
	};
	const refBus = useRef(refBusVal);
	refBus.current = refBusVal;

	/**
	 * New vertex drag event handler
	 */
	const handleNewVertexDrag = useCallback((e: DiagramDragEvent) => {
		const { id, items, onDiagramChange, newVertexList } = refBus.current;
		// Processing at drag start
		if (e.eventPhase === "Started") {
			// Store the items of owner Path component at the start of the new vertex drag.
			startItems.current = items;

			// Set the new vertex being dragged
			setDraggingNewVertex({ id: e.id, x: e.startX, y: e.startY });

			// Add a vertex at the same position as the new vertex and update the path
			const idx = newVertexList.findIndex((v) => v.id === e.id);
			const newItems = [...items];
			const newItem = {
				id: e.id,
				type: "PathPoint",
				x: e.startX,
				y: e.startY,
			} as Diagram;
			newItems.splice(idx + 1, 0, newItem);

			// Notify path change
			onDiagramChange?.({
				eventId: e.eventId,
				eventPhase: e.eventPhase,
				id,
				startDiagram: {
					items: startItems.current,
				} as PathState,
				endDiagram: {
					items: newItems,
				} as PathState,
				minX: e.minX,
				minY: e.minY,
			});
		}

		// Processing during drag
		if (e.eventPhase === "InProgress") {
			// Update the position of the new vertex being dragged
			setDraggingNewVertex({ id: e.id, x: e.endX, y: e.endY });

			// Notify path vertex position change due to new vertex drag
			onDiagramChange?.({
				eventId: e.eventId,
				eventPhase: e.eventPhase,
				id,
				startDiagram: {
					items: startItems.current,
				} as PathState,
				endDiagram: {
					items: items.map((item) =>
						item.id === e.id ? { ...item, x: e.endX, y: e.endY } : item,
					),
				} as PathState,
				minX: e.minX,
				minY: e.minY,
			});
		}

		// Processing at drag completion
		if (e.eventPhase === "Ended") {
			// Clear the new vertex being dragged
			setDraggingNewVertex(undefined);

			// Notify path data change due to new vertex drag completion
			onDiagramChange?.({
				eventId: e.eventId,
				eventPhase: e.eventPhase,
				id,
				startDiagram: {
					items: startItems.current,
				} as PathState,
				endDiagram: {
					items: items.map((item) =>
						item.id === e.id
							? {
									...item,
									id: newId(), // When drag is completed, change from new vertex ID to new ID
									x: e.endX,
									y: e.endY,
								}
							: item,
					),
				} as PathState,
				minX: e.minX,
				minY: e.minY,
			});
		}
	}, []);

	return newVertexList.map((item) => (
		<NewVertex key={item.id} {...item} onDrag={handleNewVertexDrag} />
	));
};

export const NewVertexList = memo(NewVertexListComponent);
