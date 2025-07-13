// Import React.
import { useCallback, useRef } from "react";

// Import types related to SvgCanvas.
import type { SvgCanvasScrollEvent } from "../../../types/events/SvgCanvasScrollEvent";
import { EVENT_NAME_SVG_CANVAS_SCROLL } from "../../../constants/EventNames";
import { InteractionState } from "../../types/InteractionState";

// Import EventBus.
import type { SvgCanvasSubHooksProps } from "../../types/SvgCanvasSubHooksProps";

/**
 * Custom hook to handle scroll events on the canvas.
 */
export const useScroll = (props: SvgCanvasSubHooksProps) => {
	const { eventBus } = props;

	// Create references bypass to avoid function creation in every render.
	const refBusVal = {
		props,
	};
	const refBus = useRef(refBusVal);
	refBus.current = refBusVal;

	return useCallback(
		(e: SvgCanvasScrollEvent) => {
			// Bypass references to avoid function creation in every render.
			const { setCanvasState } = refBus.current.props;

			setCanvasState((prevState) => {
				// Only update state directly if interaction state is Normal
				if (prevState.interactionState === InteractionState.Normal) {
					return {
						...prevState,
						minX: e.minX,
						minY: e.minY,
					};
				}

				// When not in Normal state, just dispatch the event for other handlers
				eventBus.dispatchEvent(
					new CustomEvent(EVENT_NAME_SVG_CANVAS_SCROLL, {
						detail: e,
					}),
				);

				return prevState;
			});
		},
		[eventBus],
	);
};
