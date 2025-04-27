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

// Imports related to this component.
import { useAddItem } from "./useAddItem";

/**
 * Custom hook to handle new diagram events on the canvas.
 */
export const useNewDiagram = (props: CanvasHooksProps) => {
	// Get the function to add items to the canvas.
	const addItem = useAddItem(props);

	// Create references bypass to avoid function creation in every render.
	const refBusVal = {
		props,
		addItem,
	};
	const refBus = useRef(refBusVal);
	refBus.current = refBusVal;

	return useCallback((e: NewDiagramEvent) => {
		// Bypass references to avoid function creation in every render.
		const {
			addItem,
			props: { canvasState },
		} = refBus.current;

		const centerX =
			canvasState.minX + canvasState.scrollLeft + window.innerWidth / 2;
		const centerY =
			canvasState.minY + canvasState.scrollTop + window.innerHeight / 2;

		const diagramType = e.diagramType as DiagramType;

		// Create a new diagram based on the diagram type.
		const data = DiagramCreateFunctions[diagramType]({
			x: centerX,
			y: centerY,
		}) as Diagram;

		if (e.isSelected && isSelectableData(data)) {
			data.isSelected = true;
		}

		if (data) {
			addItem(data);
		}
	}, []);
};
