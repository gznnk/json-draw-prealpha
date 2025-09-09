// Import React.
import { useRef, useState, type RefObject } from "react";

// Import types related to SvgCanvas.
import type { TextEditorState } from "../components/core/Textable";
import type { DiagramData } from "../types/data/catalog/DiagramData";
import type { Diagram } from "../types/state/core/Diagram";
import { InteractionState } from "./types/InteractionState";
import type { SvgCanvasData } from "./types/SvgCanvasData";
import type { SvgCanvasRef } from "./types/SvgCanvasRef";
import type { SvgCanvasState } from "./types/SvgCanvasState";
import type { SvgCanvasSubHooksProps } from "./types/SvgCanvasSubHooksProps";

// Import utils.
import { deepCopy } from "../utils/core/deepCopy";
import { diagramDataListToDiagramList } from "./utils/diagramDataListToDiagramList";

// Import shared modules.
import { EventBus } from "../../../shared/event-bus/EventBus";

// Import canvas custom hooks.
import { useAddDiagramByType } from "./hooks/actions/useAddDiagramByType";
import { useConstraintChange } from "./hooks/actions/useConstraintChange";
import { useCopy } from "./hooks/actions/useCopy";
import { useDelete } from "./hooks/actions/useDelete";
import { useOnDiagramChange } from "./hooks/diagram/useOnDiagramChange";
import { useExport } from "./hooks/actions/useExport";
import { useGroup } from "./hooks/actions/useGroup";
import { usePaste } from "./hooks/actions/usePaste";
import { usePreviewConnectLine } from "./hooks/actions/usePreviewConnectLine";
import { useStackOrderChange } from "./hooks/actions/useStackOrderChange";
import { useStyleChange } from "./hooks/actions/useStyleChange";
import { useUngroup } from "./hooks/actions/useUngroup";
import { useOnAddDiagram } from "./hooks/diagram/useOnAddDiagram";
import { useOnClick } from "./hooks/diagram/useOnClick";
import { useOnConnect } from "./hooks/diagram/useOnConnect";
import { useOnDrag } from "./hooks/diagram/useOnDrag";
import { useOnDragLeave } from "./hooks/diagram/useOnDragLeave";
import { useOnDragOver } from "./hooks/diagram/useOnDragOver";
import { useOnExecute } from "./hooks/diagram/useOnExecute";
import { useOnHoverChange } from "./hooks/diagram/useOnHoverChange";
import { useOnSelect } from "./hooks/diagram/useOnSelect";
import { useOnTextChange } from "./hooks/diagram/useOnTextChange";
import { useOnTransform } from "./hooks/diagram/useOnTransform";
import { useRedo } from "./hooks/history/useRedo";
import { useUndo } from "./hooks/history/useUndo";
import { useCtrl } from "./hooks/keyboard/useCtrl";
import { useGrabScroll } from "./hooks/navigation/useGrabScroll";
import { useNavigate } from "./hooks/navigation/useNavigate";
import { useScroll } from "./hooks/navigation/useScroll";
import { useZoom } from "./hooks/navigation/useZoom";
import { useAreaSelection } from "./hooks/selection/useAreaSelection";
import { useClearAllSelection } from "./hooks/selection/useClearAllSelection";
import { useSelectAll } from "./hooks/selection/useSelectAll";
import { useOnConnectNodes } from "./hooks/tools/useOnConnectNodes";

/**
 * Props for the useSvgCanvas hook.
 */
type SvgCanvasHooksProps = {
	id: string;
	minX: number;
	minY: number;
	items: DiagramData[];
	zoom: number;
	canvasRef: RefObject<SvgCanvasRef | null>;
	onDataChange?: (data: SvgCanvasData) => void;
};

/**
 * The SvgCanvas state and functions.
 *
 * @param props - Initial properties for the SVG canvas
 * @returns The state, props and functions of the SvgCanvas
 */
export const useSvgCanvas = (props: SvgCanvasHooksProps) => {
	// Create EventBus instance for canvas-wide event communication
	const eventBusRef = useRef(new EventBus());

	// Convert props.items from DiagramData[] to Diagram[] format
	const stateItems: Diagram[] = diagramDataListToDiagramList(props.items);

	// The state of the canvas.
	const [canvasState, setCanvasState] = useState<SvgCanvasState>({
		id: props.id,
		minX: props.minX,
		minY: props.minY,
		zoom: props.zoom,
		items: stateItems,
		history: [
			{
				id: props.id,
				minX: props.minX,
				minY: props.minY,
				zoom: props.zoom,
				items: deepCopy(stateItems),
			},
		],
		historyIndex: 0,
		lastHistoryEventId: "",
		textEditorState: { isActive: false } as TextEditorState,
		interactionState: InteractionState.Idle,
		areaSelectionState: {
			startX: 0,
			startY: 0,
			endX: 0,
			endY: 0,
		},
	});

	// Create props for the canvas hooks.
	const canvasHooksProps: SvgCanvasSubHooksProps = {
		canvasState,
		setCanvasState,
		canvasRef: props.canvasRef.current,
		onDataChange: props.onDataChange,
		eventBus: eventBusRef.current,
	};

	// keyboard
	// Ctrl key state management
	const { isCtrlPressed } = useCtrl();

	// actions
	// Handler for the new diagram event.
	const onAddDiagramByType = useAddDiagramByType(canvasHooksProps);

	// Handler for the diagram constraint change event.
	const onConstraintChange = useConstraintChange(canvasHooksProps);

	// Handler for the copy event.
	const onCopy = useCopy(canvasHooksProps);

	// Handler for the delete event.
	const onDelete = useDelete(canvasHooksProps);

	// Handler for the export event.
	const onExport = useExport(canvasHooksProps);

	// Handler for the group event.
	const onGroup = useGroup(canvasHooksProps);

	// Handler for the paste event.
	const onPaste = usePaste(canvasHooksProps);

	// Handler for the preview connect line event.
	const onPreviewConnectLine = usePreviewConnectLine(canvasHooksProps);

	// Handler for the stack order change event.
	const onStackOrderChange = useStackOrderChange(canvasHooksProps);

	// Handler for the diagram style change event.
	const onStyleChange = useStyleChange(canvasHooksProps);

	// Handler for the ungroup event.
	const onUngroup = useUngroup(canvasHooksProps);

	// diagram
	// Hooks for the add diagram tool.
	useOnAddDiagram(canvasHooksProps);

	// Handler for the click event.
	const onClick = useOnClick(canvasHooksProps, isCtrlPressed);

	// Handler for the diagram connect event.
	const onConnect = useOnConnect(canvasHooksProps);

	// Handler for the diagram change event.
	const onDiagramChange = useOnDiagramChange(canvasHooksProps);

	// Handler for the drag event.
	const onDrag = useOnDrag(canvasHooksProps);

	// Handler for the drag leave event.
	const onDragLeave = useOnDragLeave(canvasHooksProps);

	// Handler for the drag over event.
	const onDragOver = useOnDragOver(canvasHooksProps);

	// Handler for the execute event.
	const onExecute = useOnExecute(canvasHooksProps);

	// Handler for the hover change event.
	const onHoverChange = useOnHoverChange(canvasHooksProps);

	// Handler for the select event.
	const onSelect = useOnSelect(canvasHooksProps, isCtrlPressed);

	// Handler for the text change event (includes text editing initiation).
	const onTextChange = useOnTextChange(canvasHooksProps);

	// Handler for the transfrom event.
	const onTransform = useOnTransform(canvasHooksProps);

	// history
	// Handler for the redo event.
	const onRedo = useRedo(canvasHooksProps);

	// Handler for the undo event.
	const onUndo = useUndo(canvasHooksProps);

	// navigation
	// Use grab scroll hook for Ctrl+drag functionality
	const { onGrabStart, onGrabMove, onGrabEnd } =
		useGrabScroll(canvasHooksProps);

	// Handler for the navigate event (using scroll)
	const onNavigate = useNavigate(canvasHooksProps);

	// Handler for the scroll event.
	const onScroll = useScroll(canvasHooksProps);

	// Handler for the zoom event.
	const onZoom = useZoom(canvasHooksProps);

	// selection
	// Handler for area selection
	const { selectionState, onAreaSelection, onCancelAreaSelection } =
		useAreaSelection(canvasHooksProps);

	// Handler for the clear all selection event.
	const onClearAllSelection = useClearAllSelection(canvasHooksProps);

	// Handler for the select all event.
	const onSelectAll = useSelectAll(canvasHooksProps);

	// tools
	// Hook for the connect nodes tool.
	useOnConnectNodes(canvasHooksProps);

	// Create the canvas props object that will be passed to the SvgCanvas component.
	const canvasProps = {
		...canvasState,
		eventBus: eventBusRef.current,
		selectionState,
		// actions
		onClick,
		onConnect,
		onCopy,
		onDelete,
		onDiagramChange,
		onStyleChange,
		onConstraintChange,
		onDrag,
		onDragOver,
		onDragLeave,
		onExecute,
		onExport,
		onGroup,
		onHoverChange,
		onAddDiagramByType,
		onPaste,
		onPreviewConnectLine,
		onStackOrderChange,
		onTextChange,
		onTransform,
		onUngroup,
		// history
		onRedo,
		onUndo,
		// navigation
		onGrabStart,
		onGrabMove,
		onGrabEnd,
		onNavigate,
		onScroll,
		onZoom,
		// selection
		onAreaSelection,
		onCancelAreaSelection,
		onClearAllSelection,
		onSelect,
		onSelectAll,
	};

	return {
		state: [canvasState, setCanvasState] as const,
		canvasProps,
	};
};
