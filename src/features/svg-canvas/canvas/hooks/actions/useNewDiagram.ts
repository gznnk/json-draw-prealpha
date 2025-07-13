// Import React.
import { useCallback, useRef } from "react";

// Import types related to SvgCanvas.
import type { Diagram } from "../../../types/data/catalog/Diagram";
import type { NewDiagramEvent } from "../../../types/events/NewDiagramEvent";
import type { DiagramType } from "../../../types/core/DiagramType";
import type { SvgCanvasSubHooksProps } from "../../SvgCanvasTypes";

// Import functions related to SvgCanvas.
import { DiagramRegistry } from "../../../registry";
import { isSelectableData } from "../../../utils/validation/isSelectableData";
import { dispatchNewItemEvent } from "../listeners/addNewItem";

/**
 * Custom hook to handle new diagram events on the canvas.
 */
export const useNewDiagram = (props: SvgCanvasSubHooksProps) => {
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
		}

		if (data) {
			dispatchNewItemEvent({
				eventId: e.eventId,
				item: data,
			});
		}
	}, []);
};
