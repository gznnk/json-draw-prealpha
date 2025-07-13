// Import types.
import type { GroupData } from "../../types/data/shapes/GroupData";
import type { PathData } from "../../types/data/shapes/PathData";
import type { TextEditorState } from "../../components/core/Textable";
import type { InteractionState } from "./InteractionState";
import type { SvgCanvasData } from "./SvgCanvasData";
import type { SvgCanvasHistory } from "./SvgCanvasHistory";

/**
 * Type for the state of the SvgCanvas.
 */
export type SvgCanvasState = {
	zoom: number;
	multiSelectGroup?: GroupData;
	isDiagramChanging: boolean;
	history: SvgCanvasHistory[];
	historyIndex: number;
	lastHistoryEventId: string;
	textEditorState: TextEditorState;
	previewConnectLineState?: PathData;
	grabScrollState?: {
		isGrabScrolling: boolean;
		grabScrollOccurred: boolean;
	}; // TODO: どこかで型化
	interactionState: InteractionState;
} & SvgCanvasData;
