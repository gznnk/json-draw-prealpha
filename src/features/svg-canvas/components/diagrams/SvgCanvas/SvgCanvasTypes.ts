// Import types related to SvgCanvas.
import type { Diagram, GroupData } from "../../../types/DiagramTypes";
import type {
	ConnectPointsMoveEvent,
	DiagramChangeEvent,
	DiagramConnectEvent,
	DiagramDragDropEvent,
	DiagramDragEvent,
	DiagramSelectEvent,
	DiagramTextChangeEvent,
	DiagramTextEditEvent,
	DiagramTransformEvent,
	NewDiagramEvent,
	StackOrderChangeEvent,
	SvgCanvasResizeEvent,
} from "../../../types/EventTypes";

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

/**
 * Props for the SvgCanvas component.
 */
export type SvgCanvasProps = {
	title?: string;
	minX: number;
	minY: number;
	width: number;
	height: number;
	items: Diagram[];
	isDiagramChanging: boolean;
	multiSelectGroup?: GroupData;
	history: SvgCanvasHistory[];
	historyIndex: number;
	onTransform?: (e: DiagramTransformEvent) => void;
	onDiagramChange?: (e: DiagramChangeEvent) => void;
	onDrag?: (e: DiagramDragEvent) => void;
	onDragEnd?: (e: DiagramDragEvent) => void;
	onDrop?: (e: DiagramDragDropEvent) => void;
	onSelect?: (e: DiagramSelectEvent) => void;
	onSelectAll?: () => void;
	onAllSelectionClear?: () => void;
	onDelete?: () => void;
	onConnect?: (e: DiagramConnectEvent) => void;
	onConnectPointsMove?: (e: ConnectPointsMoveEvent) => void;
	onTextEdit?: (e: DiagramTextEditEvent) => void;
	onTextChange?: (e: DiagramTextChangeEvent) => void;
	onGroup?: () => void;
	onUngroup?: () => void;
	onUndo?: () => void;
	onRedo?: () => void;
	onCanvasResize?: (e: SvgCanvasResizeEvent) => void;
	onNewDiagram?: (e: NewDiagramEvent) => void;
	onStackOrderChange?: (e: StackOrderChangeEvent) => void;
};
