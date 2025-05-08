// Import React.
import { useCallback, useRef } from "react";

// Import types related to SvgCanvas.
import type { Diagram } from "../../types/DiagramCatalog";
import type { DiagramType } from "../../types/DiagramCatalog";
import type { NewDiagramEvent } from "../../types/EventTypes";
import type { CanvasHooksProps } from "../SvgCanvasTypes";

// Import functions related to SvgCanvas.
import { DiagramCreateFunctions } from "../../types/DiagramCatalog";
import { isSelectableData } from "../../utils";
import { dispatchNewItemEvent } from "../observers/addNewItem";

/**
 * Custom hook to handle new diagram events on the canvas.
 */
export const useNewDiagram = (props: CanvasHooksProps) => {
	// Create references bypass to avoid function creation in every render.
	const refBusVal = {
		props,
	};
	const refBus = useRef(refBusVal);
	refBus.current = refBusVal;

	return useCallback((e: NewDiagramEvent) => {
		// Bypass references to avoid function creation in every render.
		const {
			props: { canvasState },
		} = refBus.current;

		let x = 0;
		let y = 0;
		if (e.x !== undefined && e.y !== undefined) {
			x = e.x;
			y = e.y;
		} else {
			x = canvasState.minX + canvasState.scrollLeft + window.innerWidth / 2;
			y = canvasState.minY + canvasState.scrollTop + window.innerHeight / 2;
		}

		const diagramType = e.diagramType as DiagramType;

		// Create a new diagram based on the diagram type.
		const data = DiagramCreateFunctions[diagramType]({
			x,
			y,
		}) as Diagram;

		if (e.isSelected && isSelectableData(data)) {
			data.isSelected = true;
		}

		if (data) {
			dispatchNewItemEvent({
				eventId: e.eventId,
				item: data,
			});
		}
	}, []);
};
