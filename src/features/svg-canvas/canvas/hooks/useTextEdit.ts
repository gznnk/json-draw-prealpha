// Import React.
import { useCallback, useRef } from "react";

// Import types related to SvgCanvas.
import type { DiagramTextEditEvent } from "../../types/EventTypes";
import type { CanvasHooksProps } from "../SvgCanvasTypes";

// Import functions related to SvgCanvas.
import { applyRecursive } from "../SvgCanvasFunctions";

/**
 * Custom hook to handle text edit events on the canvas.
 */
export const useTextEdit = (props: CanvasHooksProps) => {
	// Create references bypass to avoid function creation in every render.
	const refBusVal = {
		props,
	};
	const refBus = useRef(refBusVal);
	refBus.current = refBusVal;

	return useCallback((e: DiagramTextEditEvent) => {
		// Bypass references to avoid function creation in every render.
		const { setCanvasState } = refBus.current.props;

		setCanvasState((prevState) => ({
			...prevState,
			items: applyRecursive(prevState.items, (item) =>
				item.id === e.id ? { ...item, isTextEditing: true } : item,
			),
		}));
	}, []);
};
