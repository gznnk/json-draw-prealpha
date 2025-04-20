// Import React.
import { useState } from "react";

// Import types related to SvgCanvas.
import type { Diagram } from "../types/DiagramCatalog";

// Import functions related to SvgCanvas.
import { deepCopy } from "../utils/Util";

// Imports related to this component.
import type { SvgCanvasState } from "./SvgCanvasTypes";

// Import canvas custom hooks.
import { useAddItem } from "./hooks/useAddItem";
import { useCanvasResize } from "./hooks/useCanvasResize";
import { useClearAllSelection } from "./hooks/useClearAllSelection";
import { useConnect } from "./hooks/useConnect";
import { useDelete } from "./hooks/useDelete";
import { useDiagramChange } from "./hooks/useDiagramChange";
import { useDrag } from "./hooks/useDrag";
import { useGroup } from "./hooks/useGroup";
import { useNewDiagram } from "./hooks/useNewDiagram";
import { useNewItem } from "./hooks/useNewItem";
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

/**
 * The SvgCanvas state and functions.
 *
 * @param initialItems - The initial items to be displayed on the canvas.
 * @returns The state and functions of the SvgCanvas.
 */
export const useSvgCanvas = (
	initialWidth: number,
	initialHeight: number,
	initialItems: Diagram[],
) => {
	// The state of the canvas.
	const [canvasState, setCanvasState] = useState<SvgCanvasState>({
		minX: 0,
		minY: 0,
		width: initialWidth,
		height: initialHeight,
		items: initialItems,
		isDiagramChanging: false,
		history: [
			{
				minX: 0,
				minY: 0,
				width: initialWidth,
				height: initialHeight,
				items: deepCopy(initialItems),
			},
		],
		historyIndex: 0,
		lastHistoryEventId: "",
	});

	// Create props for the canvas hooks.
	const canvasHooksProps = {
		canvasState,
		setCanvasState,
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

	// Handler for the canvas resize event.
	const onCanvasResize = useCanvasResize(canvasHooksProps);

	// Handler for the stack order change event.
	const onStackOrderChange = useStackOrderChange(canvasHooksProps);

	// Handler for the new item event.
	const onNewItem = useNewItem(canvasHooksProps);

	// Handler for the new diagram event.
	const onNewDiagram = useNewDiagram(canvasHooksProps);

	// Handler for the execute event.
	const onExecute = useExecute(canvasHooksProps);

	// --- Functions for accessing the canvas state and modifying the canvas. --- //

	const addItem = useAddItem(canvasHooksProps);

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
		onCanvasResize,
		onNewDiagram,
		onNewItem,
		onStackOrderChange,
		onExecute,
	};

	// --- Functions for accessing the canvas state and modifying the canvas. --- //

	const canvasFunctions = {
		addItem,
	};

	return {
		state: [canvasState, setCanvasState],
		canvasProps,
		canvasFunctions,
	} as const;
};
