// Import React.
import { useCallback, useRef } from "react";

// Import types related to SvgCanvas.
import type { CanvasHooksProps } from "../SvgCanvasTypes";
import type { SvgCanvasScrollEvent } from "../../types/events/SvgCanvasScrollEvent";

/**
 * Props for the useNavigate hook.
 */
type UseNavigateProps = CanvasHooksProps & {
	onScroll: (e: SvgCanvasScrollEvent) => void;
};

/**
 * Custom hook to handle navigation events using scroll functionality.
 * This provides a way to programmatically navigate to specific coordinates on the canvas.
 */
export const useNavigate = (props: UseNavigateProps) => {
	// Create references bypass to avoid function creation in every render.
	const refBusVal = {
		props,
	};
	const refBus = useRef(refBusVal);
	refBus.current = refBusVal;

	return useCallback((minX: number, minY: number) => {
		// Bypass references to avoid function creation in every render.
		const { onScroll } = refBus.current.props;

		// Use scroll handler with the specified coordinates
		onScroll({ minX, minY, clientX: 0, clientY: 0 });
	}, []);
};
