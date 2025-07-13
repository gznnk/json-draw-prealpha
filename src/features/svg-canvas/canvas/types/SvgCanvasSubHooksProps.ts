// Import types.
import type { EventBus } from "../../../../shared/event-bus/EventBus";
import type { SvgCanvasData } from "./SvgCanvasData";
import type { SvgCanvasRef } from "./SvgCanvasRef";
import type { SvgCanvasState } from "./SvgCanvasState";

/**
 * Type for canvas custom hooks.
 */
export type SvgCanvasSubHooksProps = {
	canvasState: SvgCanvasState;
	canvasRef?: SvgCanvasRef | null;
	setCanvasState: React.Dispatch<React.SetStateAction<SvgCanvasState>>;
	onDataChange?: (data: SvgCanvasData) => void;
	eventBus: EventBus;
};
