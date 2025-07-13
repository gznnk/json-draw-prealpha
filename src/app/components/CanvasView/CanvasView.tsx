import { memo, useRef } from "react";
import type { ReactElement } from "react";

// Import SvgCanvas component and hooks
import { SvgCanvas, useSvgCanvas } from "../../../features/svg-canvas";
import type { SvgCanvasRef } from "../../../features/svg-canvas/canvas/types/SvgCanvasRef";

// Import types
import type { CanvasViewProps } from "./CanvasViewTypes";

/**
 * Component that renders an SVG canvas using SvgCanvasData supplied by the parent.
 * Data is received directly from the parent component instead of local storage.
 */
const CanvasViewComponent = ({
	content,
	id,
	onDataChange,
}: CanvasViewProps): ReactElement => {
	// Create a reference to the canvas
	const canvasRef = useRef<SvgCanvasRef | null>(null);

	// Extract canvas data from the content
	const canvasId = id || content.id;
	const { items, minX, minY } = content;
	// Initialize required state with the useSvgCanvas hook
	const { canvasProps } = useSvgCanvas({
		id: canvasId,
		items,
		minX: minX || 0,
		minY: minY || 0,
		zoom: 1,
		canvasRef,
		onDataChange,
	});

	// Spread all required props to the SvgCanvas component
	return <SvgCanvas {...canvasProps} ref={canvasRef} />;
};

export const CanvasView = memo(CanvasViewComponent);
