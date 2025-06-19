// Import React.
import type { RefObject } from "react";

// Import types related to SvgCanvas.
import type { Diagram } from "../types/data/catalog/Diagram";
import type { TextEditorState } from "../components/core/Textable";
import type { GroupData } from "../types/data/shapes/GroupData";
import type { DiagramChangeEvent } from "../types/events/DiagramChangeEvent";
import type { DiagramConnectEvent } from "../types/events/DiagramConnectEvent";
import type { DiagramDragDropEvent } from "../types/events/DiagramDragDropEvent";
import type { DiagramDragEvent } from "../types/events/DiagramDragEvent";
import type { DiagramSelectEvent } from "../types/events/DiagramSelectEvent";
import type { DiagramStyleChangeEvent } from "../types/events/DiagramStyleChangeEvent";
import type { DiagramTextChangeEvent } from "../types/events/DiagramTextChangeEvent";
import type { DiagramTextEditEvent } from "../types/events/DiagramTextEditEvent";
import type { DiagramTransformEvent } from "../types/events/DiagramTransformEvent";
import type { ExecuteEvent } from "../types/events/ExecuteEvent";
import type { NewDiagramEvent } from "../types/events/NewDiagramEvent";
import type { StackOrderChangeEvent } from "../types/events/StackOrderChangeEvent";
import type { SvgCanvasResizeEvent } from "../types/events/SvgCanvasResizeEvent";
import type { SvgCanvasScrollEvent } from "../types/events/SvgCanvasScrollEvent";
import type { EventBus } from "../../../shared/event-bus/EventBus";

// Import area selection types.
import type { AreaSelectionState } from "./hooks/selection/useAreaSelection";

/**
 * Type for the data of the SvgCanvas.
 */
export type SvgCanvasData = {
	id: string;
	minX: number;
	minY: number;
	items: Diagram[];
};

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
	isGrabScrollReady?: boolean;
	isGrabScrolling?: boolean;
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
	canvasRef?: SvgCanvasRef | null;
	setCanvasState: React.Dispatch<React.SetStateAction<SvgCanvasState>>;
	onDataChange?: (data: SvgCanvasData) => void;
	eventBus: EventBus;
};

/**
 * Props for the SvgCanvas component.
 */
export type SvgCanvasProps = SvgCanvasState & {
	eventBus: EventBus;
	title?: string;
	selectionState?: AreaSelectionState;
	onTransform?: (e: DiagramTransformEvent) => void;
	onDiagramChange?: (e: DiagramChangeEvent) => void;
	onDiagramStyleChange?: (e: DiagramStyleChangeEvent) => void;
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
	onDataChange?: (data: SvgCanvasData) => void;
	onCanvasResize?: (e: SvgCanvasResizeEvent) => void;
	onNewDiagram?: (e: NewDiagramEvent) => void;
	onStackOrderChange?: (e: StackOrderChangeEvent) => void;
	onExecute?: (e: ExecuteEvent) => void;
	onExport?: () => void;
	onScroll?: (e: SvgCanvasScrollEvent) => void;
	onCopy?: () => void;
	onPaste?: () => void;
	onZoom?: (zoom: number) => void;
	onNavigate?: (minX: number, minY: number) => void;
	onGrabStart?: (e: React.PointerEvent<SVGSVGElement>) => boolean;
	onGrabMove?: (e: React.PointerEvent<SVGSVGElement>) => void;
	onGrabEnd?: (e: React.PointerEvent<SVGSVGElement>) => void;
	onStartAreaSelection?: (clientX: number, clientY: number) => void;
	onUpdateAreaSelection?: (clientX: number, clientY: number) => void;
	onEndAreaSelection?: () => void;
	onCancelAreaSelection?: () => void;
};
