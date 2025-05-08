// Import React.
import { useState, type RefObject } from "react";

// Import types related to SvgCanvas.
import type { Diagram } from "../types/DiagramCatalog";
import type { TextEditorState } from "../components/core/Textable";

// Import functions related to SvgCanvas.
import { deepCopy } from "../utils/Util";
import { calcOptimalCanvasSize } from "./SvgCanvasFunctions";

// Imports related to this component.
import type { SvgCanvasState, SvgCanvasRef } from "./SvgCanvasTypes";

// Import canvas custom hooks.
import { useClearAllSelection } from "./hooks/useClearAllSelection";
import { useConnect } from "./hooks/useConnect";
import { useCopy } from "./hooks/useCopy";
import { useDelete } from "./hooks/useDelete";
import { useDiagramChange } from "./hooks/useDiagramChange";
import { useDrag } from "./hooks/useDrag";
import { useGroup } from "./hooks/useGroup";
import { useNewDiagram } from "./hooks/useNewDiagram";
import { useNewItem } from "./hooks/useNewItem";
import { usePaste } from "./hooks/usePaste";
import { useRedo } from "./hooks/useRedo";
import { useSelect } from "./hooks/useSelect";
import { useSelectAll } from "./hooks/useSelectAll";
import { useStackOrderChange } from "./hooks/useStackOrderChange";
import { useTextChange } from "./hooks/useTextChange";
import { useTextEdit } from "./hooks/useTextEdit";
import { useTransform } from "./hooks/useTransform";
import { useUndo } from "./hooks/useUndo";
import { useUngroup } from "./hooks/useUngroup";
import { useExecute } from "./hooks/useExecute";
import { useExport } from "./hooks/useExport";
import { useScroll } from "./hooks/useScroll";
import { useConnectNodes } from "./hooks/useConnectNodes";

/**
 * Props for the useSvgCanvas hook.
 */
type SvgCanvasHooksProps = {
	minX: number;
	minY: number;
	width: number;
	height: number;
	items: Diagram[];
	scrollLeft: number;
	scrollTop: number;
	canvasRef: RefObject<SvgCanvasRef | null>;
};

/**
 * The SvgCanvas state and functions.
 *
 * @param props - Initial properties for the SVG canvas
 * @returns The state, props and functions of the SvgCanvas
 */
export const useSvgCanvas = (props: SvgCanvasHooksProps) => {
	// Calculate the initial bounds of the canvas.
	let initialBounds = {
		minX: props.minX,
		minY: props.minY,
		width: props.width,
		height: props.height,
	};
	if (props.items.length > 0) {
		initialBounds = calcOptimalCanvasSize(props.items);
	}

	// The state of the canvas.
	const [canvasState, setCanvasState] = useState<SvgCanvasState>({
		...initialBounds,
		items: props.items,
		isDiagramChanging: false,
		scrollLeft: props.scrollLeft,
		scrollTop: props.scrollTop,
		history: [
			{
				...initialBounds,
				items: deepCopy(props.items),
			},
		],
		historyIndex: 0,
		lastHistoryEventId: "",
		textEditorState: { isActive: false } as TextEditorState,
	});

	// Create props for the canvas hooks.
	const canvasHooksProps = {
		canvasState,
		setCanvasState,
		canvasRef: props.canvasRef.current,
	};

	// Handler for the drag event.
	const onDrag = useDrag(canvasHooksProps);

	// Handler for the transfrom event.
	const onTransform = useTransform(canvasHooksProps);

	// Handler for the diagram change event.
	const onDiagramChange = useDiagramChange(canvasHooksProps);

	// Handler for the select event.
	const onSelect = useSelect(canvasHooksProps);

	// Handler for the select all event.
	const onSelectAll = useSelectAll(canvasHooksProps);

	// Handler for the clear all selection event.
	const onClearAllSelection = useClearAllSelection(canvasHooksProps);

	// Handler for the delete event.
	const onDelete = useDelete(canvasHooksProps);

	// Handler for the diagram connect event.
	const onConnect = useConnect(canvasHooksProps);

	// Handler for the start of text editing.
	const onTextEdit = useTextEdit(canvasHooksProps);

	// Handler for the text change event.
	const onTextChange = useTextChange(canvasHooksProps);

	// Handler for the group event.
	const onGroup = useGroup(canvasHooksProps);

	// Handler for the ungroup event.
	const onUngroup = useUngroup(canvasHooksProps);

	// Handler for the undo event.
	const onUndo = useUndo(canvasHooksProps);

	// Handler for the redo event.
	const onRedo = useRedo(canvasHooksProps);

	// Handler for the stack order change event.
	const onStackOrderChange = useStackOrderChange(canvasHooksProps);

	// Handler for the new item event.
	const onNewItem = useNewItem(canvasHooksProps);

	// Handler for the new diagram event.
	const onNewDiagram = useNewDiagram(canvasHooksProps);

	// Handler for the execute event.
	const onExecute = useExecute(canvasHooksProps);

	// Handler for the export event.
	const onExport = useExport(canvasHooksProps);

	// Handler for the scroll event.
	const onScroll = useScroll(canvasHooksProps);

	// Handler for the connect nodes event.
	useConnectNodes(canvasHooksProps);

	// Handler for the copy event.
	const onCopy = useCopy(canvasHooksProps);

	// Handler for the paste event.
	const onPaste = usePaste(canvasHooksProps);

	const canvasProps = {
		...canvasState,
		onDrag,
		onSelect,
		onSelectAll,
		onClearAllSelection,
		onDelete,
		onConnect,
		onTransform,
		onDiagramChange,
		onTextEdit,
		onTextChange,
		onGroup,
		onUngroup,
		onUndo,
		onRedo,
		onNewDiagram,
		onNewItem,
		onStackOrderChange,
		onExecute,
		onExport,
		onScroll,
		onCopy,
		onPaste,
	};

	return {
		state: [canvasState, setCanvasState] as const,
		canvasProps,
	};
};
