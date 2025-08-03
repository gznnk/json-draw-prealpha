// Import React.
import { useCallback, useRef } from "react";

// Import types related to SvgCanvas.
import type { ConnectLineState } from "../../../types/state/shapes/ConnectLineState";
import { EVENT_NAME_EXECUTION_PROPAGATION } from "../../../constants/EventNames";
import type { ExecuteEvent } from "../../../types/events/ExecuteEvent";
import type { ExecutionPropagationEvent } from "../../../types/events/ExecutionPropagationEvent";
import type { SvgCanvasSubHooksProps } from "../../types/SvgCanvasSubHooksProps";

// Import functions related to SvgCanvas.
import { triggerFlashConnectLine } from "../../../components/shapes/ConnectLine";

/**
 * Custom hook to handle execute events on the canvas.
 */
export const useOnExecute = (props: SvgCanvasSubHooksProps) => {
	// Get EventBus instance from props
	const { eventBus } = props;

	// Create references bypass to avoid function creation in every render.
	const refBusVal = {
		props,
	};
	const refBus = useRef(refBusVal);
	refBus.current = refBusVal;

	return useCallback(
		(e: ExecuteEvent) => {
			// Bypass references to avoid function creation in every render.
			const {
				props: { canvasState },
			} = refBus.current;

			const lines = canvasState.items.filter((i) => {
				if (i.type !== "ConnectLine") return false;

				const connectLine = i as ConnectLineState;
				return connectLine.startOwnerId === e.id;
			}) as ConnectLineState[];

			for (const line of lines) {
				triggerFlashConnectLine(line);
			}

			const detail = {
				...e,
				targetId: lines.map((i) => i.endOwnerId),
			} as ExecutionPropagationEvent;

			if (0 < detail.targetId.length) {
				eventBus.dispatchEvent(
					new CustomEvent(EVENT_NAME_EXECUTION_PROPAGATION, {
						detail,
					}),
				);
			}
		},
		[eventBus],
	);
};
