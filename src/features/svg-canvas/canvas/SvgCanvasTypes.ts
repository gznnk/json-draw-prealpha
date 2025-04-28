// Import types related to SvgCanvas.
import type { TextEditorState } from "../components/core/Textable";
import type { GroupData } from "../components/shapes/Group/GroupTypes";
import type { Diagram } from "../types/DiagramCatalog";
import type {
	ConnectNodesEvent,
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
 * Type for canvas custom hooks.
 */
export type CanvasHooksProps = {
	canvasState: SvgCanvasState;
	setCanvasState: React.Dispatch<React.SetStateAction<SvgCanvasState>>;
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
	onNewItem?: (e: NewItemEvent) => void;
	onStackOrderChange?: (e: StackOrderChangeEvent) => void;
	onExecute?: (e: ExecuteEvent) => void;
	onExport?: () => void;
	onScroll?: (e: React.UIEvent<HTMLDivElement, UIEvent>) => void;
	onConnectNodes?: (e: ConnectNodesEvent) => void;
};
