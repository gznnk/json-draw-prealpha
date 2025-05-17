import {
	memo,
	useCallback,
	useEffect,
	useState,
	type ReactElement,
} from "react";
import { renderMarkdown } from "../../markdown";
import { type MarkdownEditorProps, MarkdownViewMode } from "../types";
import {
	DEFAULT_MIN_HEIGHT,
	DEFAULT_PLACEHOLDER,
	VIEW_MODE_LABELS,
} from "./MarkdownEditorConstants";
import {
	EditorContainer,
	EditorSection,
	MarkdownTextarea,
	PreviewArea,
	Toolbar,
	ToolbarButton,
} from "./MarkdownEditorStyled";

const MarkdownEditorComponent = ({
	initialMarkdown = "",
	onChange,
	defaultViewMode = MarkdownViewMode.SPLIT,
	placeholder = DEFAULT_PLACEHOLDER,
	minHeight = DEFAULT_MIN_HEIGHT,
}: MarkdownEditorProps): ReactElement => {
	// マークダウンコンテンツの状態管理
	const [markdown, setMarkdown] = useState(initialMarkdown);
	// 表示モードの状態管理
	const [viewMode, setViewMode] = useState(defaultViewMode);
	// レンダリングされたHTMLの状態管理
	const [renderedHtml, setRenderedHtml] = useState("");

	// マークダウンが変更されたときにHTMLをレンダリングし直す
	useEffect(() => {
		setRenderedHtml(renderMarkdown(markdown));
	}, [markdown]);

	// テキストエリアの変更イベントハンドラ
	const handleChange = useCallback(
		(e: React.ChangeEvent<HTMLTextAreaElement>) => {
			const newValue = e.target.value;
			setMarkdown(newValue);
			// 親コンポーネントに変更を通知
			if (onChange) {
				onChange(newValue);
			}
		},
		[onChange],
	);

	// 表示モード切り替えハンドラ
	const handleViewModeChange = useCallback((mode: MarkdownViewMode) => {
		setViewMode(mode);
	}, []);

	return (
		<div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
			{/* ツールバー */}
			<Toolbar>
				<ToolbarButton
					active={viewMode === MarkdownViewMode.SPLIT}
					onClick={() => handleViewModeChange(MarkdownViewMode.SPLIT)}
				>
					{VIEW_MODE_LABELS.split}
				</ToolbarButton>
				<ToolbarButton
					active={viewMode === MarkdownViewMode.EDITOR_ONLY}
					onClick={() => handleViewModeChange(MarkdownViewMode.EDITOR_ONLY)}
				>
					{VIEW_MODE_LABELS.editorOnly}
				</ToolbarButton>
				<ToolbarButton
					active={viewMode === MarkdownViewMode.PREVIEW_ONLY}
					onClick={() => handleViewModeChange(MarkdownViewMode.PREVIEW_ONLY)}
				>
					{VIEW_MODE_LABELS.previewOnly}
				</ToolbarButton>
			</Toolbar>

			{/* エディタとプレビューのコンテナ */}
			<EditorContainer style={{ minHeight }}>
				{/* マークダウン入力エリア */}
				<EditorSection viewMode={viewMode} isEditor={true}>
					<MarkdownTextarea
						value={markdown}
						onChange={handleChange}
						placeholder={placeholder}
					/>
				</EditorSection>

				{/* プレビュー表示エリア */}
				<EditorSection viewMode={viewMode} isEditor={false}>
					<PreviewArea dangerouslySetInnerHTML={{ __html: renderedHtml }} />
				</EditorSection>
			</EditorContainer>
		</div>
	);
};

export const MarkdownEditor = memo(MarkdownEditorComponent);
