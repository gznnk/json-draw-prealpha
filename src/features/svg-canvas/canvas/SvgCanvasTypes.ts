// Import types related to SvgCanvas.
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
	NewItemEvent,
	StackOrderChangeEvent,
	SvgCanvasResizeEvent,
} from "../types/EventTypes";
import type { GroupData } from "../components/shapes/Group/GroupTypes";

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
 * Type for canvas custom hooks.
 */
export type CanvasHooksProps = {
	canvasState: SvgCanvasState;
	setCanvasState: React.Dispatch<React.SetStateAction<SvgCanvasState>>;
};

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
	onTextEdit?: (e: DiagramTextEditEvent) => void;
	onTextChange?: (e: DiagramTextChangeEvent) => void;
	onGroup?: () => void;
	onUngroup?: () => void;
	onUndo?: () => void;
	onRedo?: () => void;
	onCanvasResize?: (e: SvgCanvasResizeEvent) => void;
	onNewDiagram?: (e: NewDiagramEvent) => void;
	onNewItem?: (e: NewItemEvent) => void;
	onStackOrderChange?: (e: StackOrderChangeEvent) => void;
	onExecute?: (e: ExecuteEvent) => void;
};
