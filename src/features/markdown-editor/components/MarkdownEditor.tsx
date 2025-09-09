import {
	memo,
	useCallback,
	useEffect,
	useRef,
	useState,
	type ReactElement,
} from "react";
import { renderMarkdown } from "../../../shared/markdown";
import type { MarkdownEditorProps } from "../types";
import {
	DEFAULT_MIN_HEIGHT,
	DEFAULT_PLACEHOLDER,
	DEFAULT_TITLE_PLACEHOLDER,
	VIEW_MODE_LABELS,
} from "./MarkdownEditorConstants";
import {
	EditorContainer,
	EditorWrapper,
	MarkdownTextarea,
	Toolbar,
	ToolbarButton,
	ToolbarLeft,
	ToolbarRight,
	TitleInput,
} from "./MarkdownEditorStyled";
import { SafeHtmlPreview } from "./SafeHtmlPreview";
import {
	adjustScrollBasedOnCaret,
	syncScroll,
} from "./MarkdownEditorUtils";

const MarkdownEditorComponent = ({
	markdown = "",
	onChange,
	title = "",
	onTitleChange,
	titlePlaceholder = DEFAULT_TITLE_PLACEHOLDER,
	placeholder = DEFAULT_PLACEHOLDER,
	minHeight = DEFAULT_MIN_HEIGHT,
}: MarkdownEditorProps): ReactElement => {
	// レンダリングされたHTMLの状態管理
	const [renderedHtml, setRenderedHtml] = useState("");
	// 表示状態の管理
	const [showEditor, setShowEditor] = useState(true);
	const [showPreview, setShowPreview] = useState(true);
	// テキストエリアとプレビューの参照
	const textareaRef = useRef<HTMLTextAreaElement | null>(null);
	const previewRef = useRef<HTMLDivElement | null>(null);

	// スクロール同期のフラグ
	const isScrollingEditor = useRef(false);
	const isScrollingPreview = useRef(false);

	// マークダウンが変更されたときにHTMLをレンダリングし直す
	useEffect(() => {
		setRenderedHtml(renderMarkdown(markdown));
	}, [markdown]);

	/**
	 * スクロールをロックして他方のペインを同期させる
	 * @param source - スクロール元の要素
	 * @param target - スクロール先の要素
	 * @param sourceIsEditor - スクロール元がエディタかどうか
	 */
	const syncScrollWithTimeout = useCallback(
		(source: HTMLElement, target: HTMLElement, sourceIsEditor: boolean) => {
			syncScroll(
				source,
				target,
				// 同期開始前に実行
				() => {
					if (sourceIsEditor) {
						isScrollingEditor.current = true;
					} else {
						isScrollingPreview.current = true;
					}
				}, // 同期終了後に実行
				() => {
					// スクロール同期完了後は両方のフラグをリセット
					isScrollingEditor.current = false;
					isScrollingPreview.current = false;
				},
				50,
			);
		},
		[],
	);

	// エディタのスクロールイベントハンドラ
	const handleEditorScroll = useCallback(() => {
		if (
			isScrollingPreview.current ||
			!showPreview ||
			!textareaRef.current ||
			!previewRef.current
		)
			return;

		syncScrollWithTimeout(textareaRef.current, previewRef.current, true);
	}, [showPreview, syncScrollWithTimeout]);

	// プレビューのスクロールイベントハンドラ
	const handlePreviewScroll = useCallback(() => {
		if (
			isScrollingEditor.current ||
			!showEditor ||
			!textareaRef.current ||
			!previewRef.current
		)
			return;

		syncScrollWithTimeout(previewRef.current, textareaRef.current, false);
	}, [showEditor, syncScrollWithTimeout]);

	// スクロールイベントのリスナーを設定
	useEffect(() => {
		const textarea = textareaRef.current;
		const preview = previewRef.current;

		if (textarea && preview && showEditor && showPreview) {
			textarea.addEventListener("scroll", handleEditorScroll);
			preview.addEventListener("scroll", handlePreviewScroll);

			return () => {
				textarea.removeEventListener("scroll", handleEditorScroll);
				preview.removeEventListener("scroll", handlePreviewScroll);
			};
		}
	}, [handleEditorScroll, handlePreviewScroll, showEditor, showPreview]);

	// テキストエリアの変更イベントハンドラ
	const handleChange = useCallback(
		(e: React.ChangeEvent<HTMLTextAreaElement>) => {
			const newValue = e.target.value;
			const textarea = e.target;

			// 最後の行での入力を検出するための処理
			const lines = newValue.split("\n");
			const isLastLine = textarea.selectionStart === newValue.length;
			const isFirstCharInText = newValue.length === 1;

			// 最終行に入力があった場合、またはテキストが1文字だけの場合
			// handleKeyDownだけでは捕捉できないケースがあるため、ここでもスクロール調整
			if ((isLastLine && lines.length > 0) || isFirstCharInText) {
				// 少し遅延を入れて、DOMの更新後に実行
				setTimeout(() => {
					if (!textarea) return;
					// 最下部にスクロール
					textarea.scrollTop = textarea.scrollHeight - textarea.clientHeight;

					// プレビューも同期
					if (
						showPreview &&
						previewRef.current &&
						!isScrollingPreview.current
					) {
						syncScrollWithTimeout(textarea, previewRef.current, true);
					}
				}, 50);
			}

			// 親コンポーネントに変更を通知
			if (onChange) {
				onChange(newValue);
			}
		},
		[onChange, showPreview, syncScrollWithTimeout],
	);
	// キー入力情報を保持するref
	const lastKeyPressRef = useRef<string | null>(null);

	// キャレット位置に基づいてスクロールを調整（全てのキー入力に対応）
	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
			// 全てのキー入力で処理する（特殊キーは除外可能だが一旦すべて処理）
			if (textareaRef.current) {
				// 最後に押されたキーを記録
				lastKeyPressRef.current = e.key;

				// requestAnimationFrameを使用して次の描画フレームでスクロールを調整
				requestAnimationFrame(() => {
					const textarea = textareaRef.current;
					if (!textarea) return;

					// キャレット位置に基づいてスクロールを調整
					adjustScrollBasedOnCaret(textarea, e.key);

					// エディタがスクロールされたとき、プレビューも同期させる
					if (
						showPreview &&
						previewRef.current &&
						!isScrollingPreview.current
					) {
						syncScrollWithTimeout(textarea, previewRef.current, true);
					}
				});
			}
		},
		[showPreview, syncScrollWithTimeout],
	);

	return (
		<EditorWrapper minHeight={minHeight}>
			{/* ツールバー */}
			<Toolbar>
				{/* 左側：タイトル入力欄 */}
				<ToolbarLeft>
					<TitleInput
						type="text"
						value={title}
						onChange={(e) => onTitleChange?.(e.target.value)}
						placeholder={titlePlaceholder}
					/>
				</ToolbarLeft>

				{/* 右側：ビューモード切り替えボタン */}
				<ToolbarRight>
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
				</ToolbarRight>
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
				{showPreview && (
					<SafeHtmlPreview ref={previewRef} html={renderedHtml} />
				)}
			</EditorContainer>
		</EditorWrapper>
	);
};

export const MarkdownEditor = memo(MarkdownEditorComponent);
