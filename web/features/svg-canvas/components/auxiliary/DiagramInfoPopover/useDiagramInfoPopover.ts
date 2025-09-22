import { useCallback } from "react";

import type { DiagramInfoPopoverProps } from "./iagramInfoPopoverTypes";
import type { SvgCanvasProps } from "../../../canvas/types/SvgCanvasProps";
import {
	DISTANCE_FROM_DIAGRAM,
	POPOVER_HEIGHT,
	POPOVER_WIDTH,
} from "../../../constants/styling/auxiliary/DiagramInfoPopoverStyling";
import type { Diagram } from "../../../types/state/core/Diagram";
import { getSelectedDiagrams } from "../../../utils/core/getSelectedDiagrams";
import { newEventId } from "../../../utils/core/newEventId";
import { calcDiagramBoundingBox } from "../../../utils/math/geometry/calcDiagramBoundingBox";
import { isFrame } from "../../../utils/validation/isFrame";

/**
 * Hook for managing diagram info popover display of diagram name and description
 * @param canvasProps - SVG Canvas props containing state and configuration
 * @returns Information about which diagram to display popover info for and its position
 */
export const useDiagramInfoPopover = (
	canvasProps: SvgCanvasProps,
	containerWidth: number,
	containerHeight: number,
): DiagramInfoPopoverProps => {
	const handleNameChange = useCallback(
		(diagramId: string, name: string) => {
			if (!canvasProps.onDiagramChange) return;

			const selectedDiagrams = getSelectedDiagrams(canvasProps.items);
			const selectedDiagram = selectedDiagrams.find((d) => d.id === diagramId);
			if (!selectedDiagram) return;

			canvasProps.onDiagramChange({
				eventId: newEventId(),
				eventPhase: "Ended",
				id: diagramId,
				startDiagram: { name: selectedDiagram.name },
				endDiagram: { name },
			});
		},
		[canvasProps],
	);

	const handleDescriptionChange = useCallback(
		(diagramId: string, description: string) => {
			if (!canvasProps.onDiagramChange) return;

			const selectedDiagrams = getSelectedDiagrams(canvasProps.items);
			const selectedDiagram = selectedDiagrams.find((d) => d.id === diagramId);
			if (!selectedDiagram) return;

			canvasProps.onDiagramChange({
				eventId: newEventId(),
				eventPhase: "Ended",
				id: diagramId,
				startDiagram: { description: selectedDiagram.description },
				endDiagram: { description },
			});
		},
		[canvasProps],
	);

	// Get selected diagrams
	const selectedDiagrams = getSelectedDiagrams(canvasProps.items);

	if (selectedDiagrams.length === 0) {
		return {
			display: false,
			position: { x: 0, y: 0 },
			onNameChange: () => {},
			onDescriptionChange: () => {},
		};
	}

	const selectedDiagram = selectedDiagrams[0];

	// Calculate position for popover display
	const position = calculatePopoverPosition(
		canvasProps,
		containerWidth,
		containerHeight,
		selectedDiagram,
	);

	return {
		display: canvasProps.interactionState === "idle",
		diagram: selectedDiagram,
		position,
		onNameChange: (value: string) =>
			handleNameChange(selectedDiagram.id, value),
		onDescriptionChange: (value: string) =>
			handleDescriptionChange(selectedDiagram.id, value),
	};
};

/**
 * Calculate the position for popover display
 * Priority: right side of the shape, fallback to left side if no space
 * Note: This now works in the HTMLElementsContainer coordinate system without zoom
 */
const calculatePopoverPosition = (
	canvasProps: SvgCanvasProps,
	containerWidth: number,
	containerHeight: number,
	diagram?: Diagram,
): { x: number; y: number } => {
	if (!diagram) {
		return { x: 0, y: 0 }; // Default position if no diagram
	}
	if (!isFrame(diagram)) {
		return { x: diagram.x, y: diagram.y };
	}

	const boundingBox = calcDiagramBoundingBox(diagram);

	let popoverX = boundingBox.right * canvasProps.zoom + DISTANCE_FROM_DIAGRAM;
	if (canvasProps.minX + containerWidth < popoverX + POPOVER_WIDTH) {
		// Not enough space on the right, fallback to left
		popoverX =
			boundingBox.left * canvasProps.zoom -
			DISTANCE_FROM_DIAGRAM -
			POPOVER_WIDTH;
	}

	let popoverY = (diagram.y - POPOVER_HEIGHT / 2) * canvasProps.zoom;
	const diagramBottomY = boundingBox.bottom * canvasProps.zoom;
	if (diagramBottomY < popoverY + POPOVER_HEIGHT * canvasProps.zoom) {
		popoverY = diagramBottomY - POPOVER_HEIGHT * canvasProps.zoom;
	}
	if (popoverY < canvasProps.minY) {
		popoverY = canvasProps.minY;
	}
	const popoverBottomY = popoverY + POPOVER_HEIGHT * canvasProps.zoom;
	const viewportBottomY = canvasProps.minY + containerHeight;
	if (viewportBottomY < popoverBottomY) {
		popoverY = viewportBottomY - POPOVER_HEIGHT * canvasProps.zoom;
	}

	return {
		x: popoverX,
		y: popoverY,
	};
};
