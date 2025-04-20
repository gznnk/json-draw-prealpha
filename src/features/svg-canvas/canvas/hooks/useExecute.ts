// Import React.
import { useCallback, useRef } from "react";

// Import types related to SvgCanvas.
import type { ConnectLineData } from "../../components/shapes/ConnectLine";
import {
	EXECUTION_PROPAGATION_EVENT_NAME,
	type ExecuteEvent,
	type ExecutionPropagationEvent,
} from "../../types/EventTypes";
import type { CanvasHooksProps } from "../SvgCanvasTypes";

/**
 * Custom hook to handle execute events on the canvas.
 */
export const useExecute = (props: CanvasHooksProps) => {
	// Create references bypass to avoid function creation in every render.
	const refBusVal = {
		props,
	};
	const refBus = useRef(refBusVal);
	refBus.current = refBusVal;

	return useCallback((e: ExecuteEvent) => {
		// Bypass references to avoid function creation in every render.
		const {
			props: { canvasState },
		} = refBus.current;

		const lines = canvasState.items.filter((i) => {
			if (i.type !== "ConnectLine") return false;

			const connectLine = i as ConnectLineData;
			return connectLine.startOwnerId === e.id;
		}) as ConnectLineData[];

		const detail = {
			...e,
			targetId: lines.map((i) => i.endOwnerId),
		} as ExecutionPropagationEvent;

		document.dispatchEvent(
			new CustomEvent(EXECUTION_PROPAGATION_EVENT_NAME, {
				detail,
			}),
		);
	}, []);
};
