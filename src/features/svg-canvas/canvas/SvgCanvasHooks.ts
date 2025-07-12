// Import React.
import { useState, useRef, type RefObject } from "react";

// Import types related to SvgCanvas.
import type { Diagram } from "../types/data/catalog/Diagram";
import type { TextEditorState } from "../components/core/Textable";

// Import functions related to SvgCanvas.
import { deepCopy } from "../utils/common/deepCopy";
import { calcCanvasBounds } from "./utils/calcCanvasBounds";

// Import EventBus.
import { EventBus } from "../../../shared/event-bus/EventBus";

// Imports related to this component.
import type {
	SvgCanvasData,
	SvgCanvasRef,
	SvgCanvasState,
} from "./SvgCanvasTypes";
import { InteractionState } from "./SvgCanvasTypes";

// Import canvas custom hooks.
import { useAreaSelection } from "./hooks/selection/useAreaSelection";
import { useConnect } from "./hooks/actions/useConnect";
import { useCopy } from "./hooks/actions/useCopy";
import { useDelete } from "./hooks/actions/useDelete";
import { useDiagramChange } from "./hooks/actions/useDiagramChange";
import { useDiagramConstraintChange } from "./hooks/actions/useDiagramConstraintChange";
import { useDiagramStyleChange } from "./hooks/actions/useDiagramStyleChange";
import { useDrag } from "./hooks/actions/useDrag";
import { useDragEnter } from "./hooks/actions/useDragEnter";
import { useDragLeave } from "./hooks/actions/useDragLeave";
import { useExecute } from "./hooks/actions/useExecute";
import { useExport } from "./hooks/actions/useExport";
import { useGroup } from "./hooks/actions/useGroup";
import { useHoverChange } from "./hooks/actions/useHoverChange";
import { useNewDiagram } from "./hooks/actions/useNewDiagram";
import { usePaste } from "./hooks/actions/usePaste";
import { usePreviewConnectLine } from "./hooks/actions/usePreviewConnectLine";
import { useStackOrderChange } from "./hooks/actions/useStackOrderChange";
import { useTextChange } from "./hooks/actions/useTextChange";
import { useTransform } from "./hooks/actions/useTransform";
import { useUngroup } from "./hooks/actions/useUngroup";
import { useRedo } from "./hooks/history/useRedo";
import { useUndo } from "./hooks/history/useUndo";
import { useCtrl } from "./hooks/keyboard/useCtrl";
import { useNewItem } from "./hooks/listeners/addNewItem";
import { useConnectNodes } from "./hooks/listeners/connectNodes";
import { useGrabScroll } from "./hooks/navigation/useGrabScroll";
import { useNavigate } from "./hooks/navigation/useNavigate";
import { useScroll } from "./hooks/navigation/useScroll";
import { useZoom } from "./hooks/navigation/useZoom";
import { useClearAllSelection } from "./hooks/selection/useClearAllSelection";
import { useSelect } from "./hooks/selection/useSelect";
import { useSelectAll } from "./hooks/selection/useSelectAll";
import { useClick } from "./hooks/actions/useClick";

/**
 * Props for the useSvgCanvas hook.
 */
type SvgCanvasHooksProps = {
	id: string;
	minX: number;
	minY: number;
	items: Diagram[];
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

	// Calculate the initial bounds of the canvas.
	let initialBounds = {
		minX: props.minX,
		minY: props.minY,
	};
	if (props.items.length > 0) {
		const optimalBounds = calcCanvasBounds(props.items);
		initialBounds = {
			minX: optimalBounds.x,
			minY: optimalBounds.y,
		};
	}

	// The state of the canvas.
	const [canvasState, setCanvasState] = useState<SvgCanvasState>({
		...initialBounds,
		id: props.id,
		items: props.items,
		zoom: props.zoom,
		isDiagramChanging: false,
		history: [
			{
				...initialBounds,
				id: props.id,
				items: deepCopy(props.items),
			},
		],
		historyIndex: 0,
		lastHistoryEventId: "",
		textEditorState: { isActive: false } as TextEditorState,
		interactionState: InteractionState.Normal,
	});

	// Create props for the canvas hooks.
	const canvasHooksProps = {
		canvasState,
		setCanvasState,
		canvasRef: props.canvasRef.current,
		onDataChange: props.onDataChange,
		eventBus: eventBusRef.current,
	};

	// Ctrl key state management
	const { isCtrlPressed } = useCtrl();
	// Handler for area selection
	const { selectionState, onAreaSelection, onCancelAreaSelection } =
		useAreaSelection(canvasHooksProps);

	// actions
	// Handler for the click event.
	const onClick = useClick(canvasHooksProps, isCtrlPressed);

	// Handler for the diagram connect event.
	const onConnect = useConnect(canvasHooksProps);

	// Handler for the copy event.
	const onCopy = useCopy(canvasHooksProps);

	// Handler for the delete event.
	const onDelete = useDelete(canvasHooksProps);

	// Handler for the diagram change event.
	const onDiagramChange = useDiagramChange(canvasHooksProps);

	// Handler for the diagram style change event.
	const onDiagramStyleChange = useDiagramStyleChange(canvasHooksProps);

	// Handler for the diagram constraint change event.
	const onDiagramConstraintChange =
		useDiagramConstraintChange(canvasHooksProps);

	// Handler for the drag event.
	const onDrag = useDrag(canvasHooksProps);

	// Handler for the drag enter event.
	const onDragEnter = useDragEnter(canvasHooksProps);

	// Handler for the drag leave event.
	const onDragLeave = useDragLeave(canvasHooksProps);

	// Handler for the execute event.
	const onExecute = useExecute(canvasHooksProps);

	// Handler for the export event.
	const onExport = useExport(canvasHooksProps);

	// Handler for the group event.
	const onGroup = useGroup(canvasHooksProps);

	// Handler for the hover change event.
	const onHoverChange = useHoverChange(canvasHooksProps);

	// Handler for the new diagram event.
	const onNewDiagram = useNewDiagram(canvasHooksProps);

	// Handler for the paste event.
	const onPaste = usePaste(canvasHooksProps);

	// Handler for the preview connect line event.
	const onPreviewConnectLine = usePreviewConnectLine(canvasHooksProps);

	// Handler for the stack order change event.
	const onStackOrderChange = useStackOrderChange(canvasHooksProps);

	// Handler for the text change event (includes text editing initiation).
	const onTextChange = useTextChange(canvasHooksProps);

	// Handler for the transfrom event.
	const onTransform = useTransform(canvasHooksProps);

	// Handler for the ungroup event.
	const onUngroup = useUngroup(canvasHooksProps);

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
	// Handler for the clear all selection event.
	const onClearAllSelection = useClearAllSelection(canvasHooksProps);

	// Handler for the select event.
	const onSelect = useSelect(canvasHooksProps, isCtrlPressed);

	// Handler for the select all event.
	const onSelectAll = useSelectAll(canvasHooksProps);

	// Observer for the new item event.
	useNewItem(canvasHooksProps);

	// Observer for the connect nodes event.
	useConnectNodes(canvasHooksProps);

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
		onDiagramStyleChange,
		onDiagramConstraintChange,
		onDrag,
		onDragEnter,
		onDragLeave,
		onExecute,
		onExport,
		onGroup,
		onHoverChange,
		onNewDiagram,
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
		// other
		onDataChange: props.onDataChange,
	};

	return {
		state: [canvasState, setCanvasState] as const,
		canvasProps,
	};
};
