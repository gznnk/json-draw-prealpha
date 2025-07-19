// Import types.
import type { GroupData } from "../../types/data/shapes/GroupData";
import type { PathData } from "../../types/data/shapes/PathData";
import type { TextEditorState } from "../../components/core/Textable";
import type { GrabScrollState } from "./GrabScrollState";
import type { InteractionState } from "./InteractionState";
import type { SvgCanvasData } from "./SvgCanvasData";
import type { SvgCanvasHistory } from "./SvgCanvasHistory";

/**
 * Type for the state of the SvgCanvas.
 */
export type SvgCanvasState = {
	zoom: number;
	multiSelectGroup?: GroupData;
	history: SvgCanvasHistory[];
	historyIndex: number;
	lastHistoryEventId: string;
	textEditorState: TextEditorState;
	previewConnectLineState?: PathData;
	grabScrollState?: GrabScrollState;
	interactionState: InteractionState;
} & SvgCanvasData;
