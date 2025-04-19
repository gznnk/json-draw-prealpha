// Import React.
import { useCallback, useState } from "react";

// TODO: 場所
import { getDiagramById } from "../../../../canvas/SvgCanvasFunctions";

// Import types related to SvgCanvas.
import type { SvgCanvasProps } from "../../../../canvas/SvgCanvasTypes";
import type {
	DiagramTextEditEvent,
	DiagramTextChangeEvent,
} from "../../../../types/EventTypes";

// Imports related to this component.
import type { TextEditorProps } from "./TextEditorTypes";

export const useTextEditor = (canvasProps: SvgCanvasProps) => {
	// Extract properties from canvasProps.
	const { items, onTextEdit, onTextChange } = canvasProps;

	// State to manage the text editor.
	const [textEditorState, setTextEditorState] = useState<TextEditorProps>({
		isActive: false,
	} as TextEditorProps);

	/**
	 * Handle text edit event.
	 */
	const handleTextEdit = useCallback(
		(e: DiagramTextEditEvent) => {
			// テキストエディタを表示
			const diagram = getDiagramById(items, e.id);
			setTextEditorState({
				isActive: true,
				...diagram,
			} as TextEditorProps);

			// TODO: 他のHooksでもハンドルするケースを想定してマージする方式にしたい
			// テキスト編集イベントをHooksに通知
			onTextEdit?.(e);
		},
		[items, onTextEdit],
	);

	/**
	 * Handle text change event.
	 */
	const handleTextChange = useCallback(
		(e: DiagramTextChangeEvent) => {
			// テキストエディタを非表示
			setTextEditorState(
				(prev) =>
					({
						...prev,
						isActive: false,
					}) as TextEditorProps,
			);

			// TODO: 他のHooksでもハンドルするケースを想定してマージする方式にしたい
			// テキスト変更イベントをHooksに通知
			onTextChange?.(e);
		},
		[onTextChange],
	);

	return {
		textEditorProps: {
			...textEditorState,
			onTextChange: handleTextChange,
		},
		textEditorHandlers: {
			onTextEdit: handleTextEdit,
		},
	};
};
