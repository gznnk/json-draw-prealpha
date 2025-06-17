// Import React.
import { useCallback, useRef } from "react";

// Import types related to SvgCanvas.
import type { SvgCanvasScrollEvent } from "../../../types/events/SvgCanvasScrollEvent";
import { EVENT_NAME_SVG_CANVAS_SCROLL } from "../../../constants/EventNames";
import type { CanvasHooksProps } from "../../SvgCanvasTypes";

/**
 * Custom hook to handle scroll events on the canvas.
 */
export const useScroll = (props: CanvasHooksProps) => {
	// Create references bypass to avoid function creation in every render.
	const refBusVal = {
		props,
	};
	const refBus = useRef(refBusVal);
	refBus.current = refBusVal;

	return useCallback((e: SvgCanvasScrollEvent) => {
		// Bypass references to avoid function creation in every render.
		const { setCanvasState } = refBus.current.props;

		setCanvasState((prevState) => ({
			...prevState,
			minX: e.minX,
			minY: e.minY,
		}));

		// Dispatch a custom event with scroll position.
		document.dispatchEvent(
			new CustomEvent(EVENT_NAME_SVG_CANVAS_SCROLL, {
				bubbles: true,
				detail: e,
			}),
		);
	}, []);
};
