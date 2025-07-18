// Import React.
import { useCallback, useRef } from "react";

// Import types.
import type { DiagramType } from "../../../types/core/DiagramType";
import type { Diagram } from "../../../types/data/catalog/Diagram";
import type { AddDiagramByTypeEvent } from "../../../types/events/AddDiagramByTypeEvent";
import type { SvgCanvasSubHooksProps } from "../../types/SvgCanvasSubHooksProps";

// Import utils.
import { DiagramRegistry } from "../../../registry";
import { isSelectableData } from "../../../utils/validation/isSelectableData";
import { isTransformativeData } from "../../../utils/validation/isTransformativeData";

// Import hooks.
import { useAddDiagram } from "./useAddDiagram";

/**
 * Custom hook to handle new diagram events on the canvas.
 */
export const useAddDiagramByType = (props: SvgCanvasSubHooksProps) => {
	// Create a function to add a new diagram.
	const addDiagram = useAddDiagram(props);

	// Create references bypass to avoid function creation in every render.
	const refBusVal = {
		props,
		addDiagram,
	};
	const refBus = useRef(refBusVal);
	refBus.current = refBusVal;

	return useCallback((e: AddDiagramByTypeEvent) => {
		// Bypass references to avoid function creation in every render.
		const {
			props: { canvasState },
			addDiagram,
		} = refBus.current;

		let x = 0;
		let y = 0;
		if (e.x !== undefined && e.y !== undefined) {
			x = e.x;
			y = e.y;
		} else {
			// TODO: Use a more appropriate default position.
			// For now, center the new diagram in the viewport.
			x = canvasState.minX + window.innerWidth / 2;
			y = canvasState.minY + window.innerHeight / 2;
		}

		const diagramType = e.diagramType as DiagramType;

		// Create a new diagram based on the diagram type.
		const createFunction = DiagramRegistry.getCreateFunction(diagramType);
		const data = createFunction?.({
			x,
			y,
		}) as Diagram;

		if (!data) {
			console.warn(`Create function not found for type: ${diagramType}`);
			return;
		}

		if (e.isSelected && isSelectableData(data)) {
			data.isSelected = true;
			data.showOutline = true;
			if (isTransformativeData(data)) {
				data.showTransformControls = true;
			}
		}

		if (data) {
			addDiagram({
				eventId: e.eventId,
				item: data,
			});
		}
	}, []);
};
