// Import types related to SvgCanvas.
import type { Diagram, GroupData } from "../../../types/DiagramTypes";

/**
 * Type for the data of the SvgCanvas.
 */
export type SvgCanvasData = {
	minX: number;
	minY: number;
	width: number;
	height: number;
	items: Diagram[];
};

/**
 * Type for the state of the SvgCanvas.
 */
export type SvgCanvasState = {
	multiSelectGroup?: GroupData;
	isDiagramChanging: boolean;
	history: SvgCanvasHistory[];
	historyIndex: number;
	lastHistoryEventId: string;
} & SvgCanvasData;

/**
 * Type for the history of the SvgCanvas state.
 */
export type SvgCanvasHistory = SvgCanvasData;
