// Import React.
import { useCallback, useRef } from "react";

// Import types related to SvgCanvas.
import {
	DiagramCreateFunctions,
	type Diagram,
	type DiagramType,
} from "../../types/DiagramCatalog";
import type { NewDiagramEvent } from "../../types/EventTypes";

// Import components related to SvgCanvas.
import type { CanvasHooksProps } from "../SvgCanvasTypes";

// Import functions related to SvgCanvas.
import { isSelectableData } from "../../utils/TypeUtils";

// Import hooks related to SvgCanvas.
import { useNewItem } from "./useNewItem";

/**
 * Custom hook to handle new diagram events on the canvas.
 */
export const useNewDiagram = (props: CanvasHooksProps) => {
	// Get the function to add items to the canvas.
	const onNewItem = useNewItem(props);

	// Create references bypass to avoid function creation in every render.
	const refBusVal = {
		props,
		onNewItem,
	};
	const refBus = useRef(refBusVal);
	refBus.current = refBusVal;

	return useCallback((e: NewDiagramEvent) => {
		// Bypass references to avoid function creation in every render.
		const {
			onNewItem,
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
			onNewItem({
				eventId: e.eventId,
				item: data,
			});
		}
	}, []);
};
