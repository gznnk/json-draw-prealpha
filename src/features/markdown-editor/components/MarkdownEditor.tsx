import {
	memo,
	useCallback,
	useEffect,
	useRef,
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
	// テキストエリアの参照
	const textareaRef = useRef<HTMLTextAreaElement | null>(null);

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
	); // キャレット位置に基づいてスクロールを調整
	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
			// 矢印キーまたはエンターキーの場合のみ処理
			if (
				!["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Enter"].includes(
					e.key,
				)
			) {
				return;
			}

			if (textareaRef.current) {
				// 少し遅延を入れて、キャレット位置が更新された後に実行
				setTimeout(() => {
					const textarea = textareaRef.current;
					if (!textarea) return;

					const { scrollTop, clientHeight } = textarea;
					const caretPosition = textarea.selectionStart;

					// テキストの内容を取得して行ごとに分割
					const text = textarea.value;
					const lines = text.substring(0, caretPosition).split("\n");

					// キャレットが現在いる行数を計算（0ベース）
					const currentLineIndex = lines.length - 1;

					// 1行の高さを取得
					const lineHeight = Number.parseInt(
						getComputedStyle(textarea).lineHeight,
						10,
					);

					// キャレットのY座標を計算
					const caretY = currentLineIndex * lineHeight;

					// パディングに応じたオフセット
					const paddingTop = Number.parseInt(
						getComputedStyle(textarea).paddingTop,
						10,
					);
					const paddingBottom = Number.parseInt(
						getComputedStyle(textarea).paddingBottom,
						10,
					);

					// 上方向のスクロール調整（最初の行の場合、paddingTopを考慮）
					if (currentLineIndex === 0 || caretY < scrollTop + paddingTop) {
						textarea.scrollTop = Math.max(0, caretY - paddingTop);
					} // 下方向のスクロール調整（最後の行の場合、paddingBottomを考慮）
					const allLines = text.split("\n");
					const isLastLine = currentLineIndex === allLines.length - 1;
					const isEnterKey = e.key === "Enter";

					// 最終行の場合、スクロールを最大まで設定
					if (isLastLine) {
						textarea.scrollTop = textarea.scrollHeight - textarea.clientHeight;
					}
					// 最終行でエンターキーが押された場合も最大スクロール
					else if (isEnterKey && currentLineIndex === allLines.length - 2) {
						textarea.scrollTop = textarea.scrollHeight - textarea.clientHeight;
					}
					// 通常のスクロール調整
					else if (
						caretY + lineHeight >
						scrollTop + clientHeight - paddingBottom
					) {
						textarea.scrollTop =
							caretY + lineHeight - clientHeight + paddingBottom;
					}
				}, 0);
			}
		},
		[],
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
					<MarkdownTextarea
						ref={textareaRef}
						value={markdown}
						onChange={handleChange}
						onKeyDown={handleKeyDown}
						placeholder={placeholder}
					/>
				)}
				{/* プレビュー表示エリア */}
				{showPreview && <SafeHtmlPreview html={renderedHtml} />}
			</EditorContainer>
		</div>
	);
};

export const MarkdownEditor = memo(MarkdownEditorComponent);
