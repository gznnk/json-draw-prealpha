// Import React.
import type React from "react";
import { useRef, memo } from "react";

// Import components related to SvgCanvas.
import { SvgCanvas, useSvgCanvas } from "../../../features/svg-canvas/canvas";
import type { SvgCanvasRef } from "../../../features/svg-canvas/canvas/SvgCanvasTypes";

// Import functions related to SvgCanvas.
import { loadCanvasDataFromLocalStorage } from "../../../features/svg-canvas/canvas/SvgCanvasFunctions";

// Import types related to this component.
import type { CanvasSheetProps } from "./CanvasSheetTypes";
import type { Diagram } from "../../../features/svg-canvas/catalog/DiagramTypes";

const CanvasSheetComponent: React.FC<CanvasSheetProps> = ({ id }) => {
	const canvasRef = useRef<SvgCanvasRef | null>(null);

	// Load canvas data from local storage using the sheet ID
	const loadedCanvasState = loadCanvasDataFromLocalStorage(id);

	// Define initial canvas state
	const canvasInitialState = {
		id,
		minX: 0,
		minY: 0,
		width: window.screen.width,
		height: window.screen.height,
		items: [] as Diagram[],
		scrollLeft: 0,
		scrollTop: 0,
		canvasRef,
	};

	// Override with loaded state if available
	if (loadedCanvasState) {
		canvasInitialState.minX = loadedCanvasState.minX;
		canvasInitialState.minY = loadedCanvasState.minY;
		canvasInitialState.width = loadedCanvasState.width;
		canvasInitialState.height = loadedCanvasState.height;
		canvasInitialState.items = loadedCanvasState.items;
		canvasInitialState.scrollLeft = loadedCanvasState.scrollLeft;
		canvasInitialState.scrollTop = loadedCanvasState.scrollTop;
	}

	// Use the SvgCanvas hook with sheet-specific data
	const { canvasProps } = useSvgCanvas(canvasInitialState);

	return <SvgCanvas {...canvasProps} ref={canvasRef} />;
};

export const CanvasSheet = memo(CanvasSheetComponent);
