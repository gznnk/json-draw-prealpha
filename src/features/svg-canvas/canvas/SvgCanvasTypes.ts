// Import React.
import type { RefObject } from "react";

// Import types related to SvgCanvas.
import type { TextEditorState } from "../components/core/Textable";
import type { GroupData } from "../types/shapes";
import type { Diagram } from "../types/DiagramCatalog";
import type {
	DiagramChangeEvent,
	DiagramConnectEvent,
	DiagramDragDropEvent,
	DiagramDragEvent,
	DiagramSelectEvent,
	DiagramTextChangeEvent,
	DiagramTextEditEvent,
	DiagramTransformEvent,
	ExecuteEvent,
	NewDiagramEvent,
	StackOrderChangeEvent,
	SvgCanvasResizeEvent,
} from "../types/events";

/**
 * Type for the data of the SvgCanvas.
 */
export type SvgCanvasData = {
	id: string;
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
	scrollTop: number;
	scrollLeft: number;
	multiSelectGroup?: GroupData;
	isDiagramChanging: boolean;
	history: SvgCanvasHistory[];
	historyIndex: number;
	lastHistoryEventId: string;
	textEditorState: TextEditorState;
} & SvgCanvasData;

/**
 * Type for the history of the SvgCanvas state.
 */
export type SvgCanvasHistory = SvgCanvasData;

/**
 * Type definition for SVG canvas references that can be used across hooks.
 * This allows direct access to DOM elements without using Context API.
 */
export interface SvgCanvasRef {
	/** Reference to the container div element */
	containerRef: RefObject<HTMLDivElement | null>;
	/** Reference to the SVG element */
	svgRef: RefObject<SVGSVGElement | null>;
}

/**
 * Type for canvas custom hooks.
 */
export type CanvasHooksProps = {
	canvasState: SvgCanvasState;
	setCanvasState: React.Dispatch<React.SetStateAction<SvgCanvasState>>;
	canvasRef?: SvgCanvasRef | null;
};

/**
 * Props for the SvgCanvas component.
 */
export type SvgCanvasProps = SvgCanvasState & {
	title?: string;
	onTransform?: (e: DiagramTransformEvent) => void;
	onDiagramChange?: (e: DiagramChangeEvent) => void;
	onDrag?: (e: DiagramDragEvent) => void;
	onDragEnd?: (e: DiagramDragEvent) => void;
	onDrop?: (e: DiagramDragDropEvent) => void;
	onSelect?: (e: DiagramSelectEvent) => void;
	onSelectAll?: () => void;
	onClearAllSelection?: () => void;
	onDelete?: () => void;
	onConnect?: (e: DiagramConnectEvent) => void;
	onTextEdit?: (e: DiagramTextEditEvent) => void;
	onTextChange?: (e: DiagramTextChangeEvent) => void;
	onGroup?: () => void;
	onUngroup?: () => void;
	onUndo?: () => void;
	onRedo?: () => void;
	onCanvasResize?: (e: SvgCanvasResizeEvent) => void;
	onNewDiagram?: (e: NewDiagramEvent) => void;
	onStackOrderChange?: (e: StackOrderChangeEvent) => void;
	onExecute?: (e: ExecuteEvent) => void;
	onExport?: () => void;
	onScroll?: (e: React.UIEvent<HTMLDivElement, UIEvent>) => void;
	onCopy?: () => void;
	onPaste?: () => void;
};
