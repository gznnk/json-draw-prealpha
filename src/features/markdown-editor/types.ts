/**
 * 表示モードを定義する列挙型
 * エディターとプレビューの表示設定を制御します
 */
export enum MarkdownViewMode {
	/** エディターとプレビューの両方を表示 */
	SPLIT = "split",
	/** エディターのみ表示 */
	EDITOR_ONLY = "editor-only",
	/** プレビューのみ表示 */
	PREVIEW_ONLY = "preview-only",
}

/**
 * マークダウンエディターコンポーネントのプロパティ定義
 */
export type MarkdownEditorProps = {
	/** マークダウンコンテンツの初期値 */
	initialMarkdown?: string;
	/** マークダウンコンテンツが変更された時のコールバック関数 */
	onChange?: (markdown: string) => void;
	/** デフォルトの表示モード */
	defaultViewMode?: MarkdownViewMode;
	/** プレースホルダーテキスト */
	placeholder?: string;
	/** エディタの最小高さ（px） */
	minHeight?: number;
};
