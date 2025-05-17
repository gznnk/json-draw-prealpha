import {
	memo,
	useCallback,
	useEffect,
	useState,
	type ReactElement,
} from "react";
import { renderMarkdown } from "../../markdown";
import type { MarkdownEditorProps } from "../types";
import {
	DEFAULT_MIN_HEIGHT,
	DEFAULT_PLACEHOLDER,
	VIEW_MODE_LABELS,
} from "./MarkdownEditorConstants";
import {
	EditorContainer,
	EditorSection,
	MarkdownTextarea,
	Toolbar,
	ToolbarButton,
} from "./MarkdownEditorStyled";
import { SafeHtmlPreview } from "./SafeHtmlPreview";

const MarkdownEditorComponent = ({
	initialMarkdown = "",
	onChange,
	placeholder = DEFAULT_PLACEHOLDER,
	minHeight = DEFAULT_MIN_HEIGHT,
}: MarkdownEditorProps): ReactElement => {
	// マークダウンコンテンツの状態管理
	const [markdown, setMarkdown] = useState(initialMarkdown);
	// レンダリングされたHTMLの状態管理
	const [renderedHtml, setRenderedHtml] = useState("");
	// 表示状態の管理
	const [showEditor, setShowEditor] = useState(true);
	const [showPreview, setShowPreview] = useState(true);

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

	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				height: "100%",
				minHeight: minHeight,
			}}
		>
			{/* ツールバー */}
			<Toolbar>
				<ToolbarButton
					active={showEditor && showPreview}
					onClick={() => {
						setShowEditor(true);
						setShowPreview(true);
					}}
				>
					{VIEW_MODE_LABELS.split}
				</ToolbarButton>
				<ToolbarButton
					active={showEditor && !showPreview}
					onClick={() => {
						setShowEditor(true);
						setShowPreview(false);
					}}
				>
					{VIEW_MODE_LABELS.editorOnly}
				</ToolbarButton>
				<ToolbarButton
					active={!showEditor && showPreview}
					onClick={() => {
						setShowEditor(false);
						setShowPreview(true);
					}}
				>
					{VIEW_MODE_LABELS.previewOnly}
				</ToolbarButton>
			</Toolbar>

			{/* エディタとプレビューのコンテナ */}
			<EditorContainer>
				{/* マークダウン入力エリア */}
				{showEditor && (
					<EditorSection isEditor={true}>
						<MarkdownTextarea
							value={markdown}
							onChange={handleChange}
							placeholder={placeholder}
						/>
					</EditorSection>
				)}
				{/* プレビュー表示エリア */}
				{showPreview && (
					<EditorSection isEditor={false}>
						<SafeHtmlPreview html={renderedHtml} />
					</EditorSection>
				)}
			</EditorContainer>
		</div>
	);
};

export const MarkdownEditor = memo(MarkdownEditorComponent);
