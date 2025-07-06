// Import React.
import type { RefObject } from "react";

// Import types.
import type { Diagram } from "../types/data/catalog/Diagram";
import type { GroupData } from "../types/data/shapes/GroupData";
import type { AreaSelectionEvent } from "../types/events/AreaSelectionEvent";
import type { DiagramChangeEvent } from "../types/events/DiagramChangeEvent";
import type { DiagramClickEvent } from "../types/events/DiagramClickEvent";
import type { DiagramConnectEvent } from "../types/events/DiagramConnectEvent";
import type { DiagramConstraintChangeEvent } from "../types/events/DiagramConstraintChangeEvent";
import type { DiagramDragEvent } from "../types/events/DiagramDragEvent";
import type { DiagramDragDropEvent } from "../types/events/DiagramDragDropEvent";
import type { DiagramHoverChangeEvent } from "../types/events/DiagramHoverChangeEvent";
import type { DiagramSelectEvent } from "../types/events/DiagramSelectEvent";
import type { DiagramStyleChangeEvent } from "../types/events/DiagramStyleChangeEvent";
import type { DiagramTextChangeEvent } from "../types/events/DiagramTextChangeEvent";
import type { DiagramTransformEvent } from "../types/events/DiagramTransformEvent";
import type { ExecuteEvent } from "../types/events/ExecuteEvent";
import type { NewDiagramEvent } from "../types/events/NewDiagramEvent";
import type { StackOrderChangeEvent } from "../types/events/StackOrderChangeEvent";
import type { SvgCanvasResizeEvent } from "../types/events/SvgCanvasResizeEvent";
import type { SvgCanvasScrollEvent } from "../types/events/SvgCanvasScrollEvent";

// Import components.
import type { TextEditorState } from "../components/core/Textable";

// Import area selection types.
import type { AreaSelectionState } from "./hooks/selection/useAreaSelection";

// Import shared.
import type { EventBus } from "../../../shared/event-bus/EventBus";

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
	// actions
	onClick?: (e: DiagramClickEvent) => void;
	onConnect?: (e: DiagramConnectEvent) => void;
	onCopy?: () => void;
	onDelete?: () => void;
	onDiagramChange?: (e: DiagramChangeEvent) => void;
	onDiagramConstraintChange?: (e: DiagramConstraintChangeEvent) => void;
	onDiagramStyleChange?: (e: DiagramStyleChangeEvent) => void;
	onDrag?: (e: DiagramDragEvent) => void;
	onDragEnter?: (e: DiagramDragDropEvent) => void;
	onDragLeave?: (e: DiagramDragDropEvent) => void;
	onExecute?: (e: ExecuteEvent) => void;
	onExport?: () => void;
	onGroup?: () => void;
	onHoverChange?: (e: DiagramHoverChangeEvent) => void;
	onNewDiagram?: (e: NewDiagramEvent) => void;
	onPaste?: () => void;
	onStackOrderChange?: (e: StackOrderChangeEvent) => void;
	onTextChange?: (e: DiagramTextChangeEvent) => void;
	onTransform?: (e: DiagramTransformEvent) => void;
	onUngroup?: () => void;
	// history
	onRedo?: () => void;
	onUndo?: () => void;
	// navigation
	onGrabStart?: (e: React.PointerEvent<SVGSVGElement>) => boolean;
	onGrabMove?: (e: React.PointerEvent<SVGSVGElement>) => void;
	onGrabEnd?: (e: React.PointerEvent<SVGSVGElement>) => void;
	onNavigate?: (minX: number, minY: number) => void;
	onScroll?: (e: SvgCanvasScrollEvent) => void;
	onZoom?: (zoom: number) => void;
	// selection
	onAreaSelection?: (event: AreaSelectionEvent) => void;
	onCancelAreaSelection?: () => void;
	onClearAllSelection?: () => void;
	onSelect?: (e: DiagramSelectEvent) => void;
	onSelectAll?: () => void;
	// other
	onDataChange?: (data: SvgCanvasData) => void;
	onCanvasResize?: (e: SvgCanvasResizeEvent) => void;
};
