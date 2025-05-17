// Import React.
import { useCallback, useRef } from "react";

// Import types related to SvgCanvas.
import { SVG_CANVAS_SCROLL_EVENT_NAME } from "../../types/events/Constants";
import type { SvgCanvasScrollEvent } from "../../types/events/SvgCanvasScrollEvent";
import type { CanvasHooksProps } from "../SvgCanvasTypes";

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

	return useCallback((e: React.UIEvent<HTMLDivElement, UIEvent>) => {
		// Bypass references to avoid function creation in every render.
		const { setCanvasState } = refBus.current.props;

		const scrollTop = e.currentTarget.scrollTop;
		const scrollLeft = e.currentTarget.scrollLeft;

		setCanvasState((prevState) => ({
			...prevState,
			scrollTop: scrollTop,
			scrollLeft: scrollLeft,
		}));

		// Dispatch a custom event with scroll position.
		document.dispatchEvent(
			new CustomEvent(SVG_CANVAS_SCROLL_EVENT_NAME, {
				bubbles: true,
				detail: {
					scrollTop: scrollTop,
					scrollLeft: scrollLeft,
				} as SvgCanvasScrollEvent,
			}),
		);
	}, []);
};
