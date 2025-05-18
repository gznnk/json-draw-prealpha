/**
 * スクロール位置の割合を取得する関数
 * @param element - スクロール位置を取得する要素
 * @returns スクロール位置の割合（0〜1）
 */
export const getScrollPercentage = (element: HTMLElement): number => {
	return element.scrollTop / (element.scrollHeight - element.clientHeight) || 0;
};

/**
 * スクロール位置をパーセンテージに基づいて設定する関数
 * @param element - スクロール位置を設定する要素
 * @param percentage - 設定するスクロール位置の割合（0〜1）
 */
export const setScrollPercentage = (
	element: HTMLElement,
	percentage: number,
): void => {
	const maxScroll = element.scrollHeight - element.clientHeight;
	element.scrollTop = Math.max(0, Math.min(maxScroll, percentage * maxScroll));
};

/**
 * CSS値を安全に数値に変換する
 * @param element - スタイルを取得する要素
 * @param property - 取得するCSSプロパティ
 * @param fallback - 変換に失敗した場合のデフォルト値
 * @returns 数値に変換されたCSSプロパティ値
 */
export const getSafeComputedStyleValue = (
	element: HTMLElement,
	property: string,
	fallback = 0,
): number => {
	try {
		const computedStyle = getComputedStyle(element);
		const value = computedStyle.getPropertyValue(property);
		const parsedValue = Number.parseInt(value, 10);
		return Number.isNaN(parsedValue) ? fallback : parsedValue;
	} catch (error) {
		console.error(`Error getting computed style ${property}:`, error);
		return fallback;
	}
};

/**
 * キャレット位置に基づいてテキストエリアのスクロールを調整する
 * @param textarea - テキストエリア要素
 * @param key - 押されたキー
 */
export const adjustScrollBasedOnCaret = (
	textarea: HTMLTextAreaElement,
	key: string,
): void => {
	const { scrollTop, clientHeight } = textarea;
	const caretPosition = textarea.selectionStart;

	// テキストの内容を取得して行ごとに分割
	const text = textarea.value;
	const lines = text.substring(0, caretPosition).split("\n");

	// キャレットが現在いる行数を計算（0ベース）
	const currentLineIndex = lines.length - 1;

	// 1行の高さを取得
	const lineHeight = getSafeComputedStyleValue(textarea, "line-height", 20);

	// キャレットのY座標を計算
	const caretY = currentLineIndex * lineHeight;

	// パディングに応じたオフセット
	const paddingTop = getSafeComputedStyleValue(textarea, "padding-top");
	const paddingBottom = getSafeComputedStyleValue(textarea, "padding-bottom");

	// 上方向のスクロール調整（最初の行の場合、paddingTopを考慮）
	if (currentLineIndex === 0 || caretY < scrollTop + paddingTop) {
		textarea.scrollTop = Math.max(0, caretY - paddingTop);
		return;
	}
	// 下方向のスクロール調整の条件判定
	const allLines = text.split("\n");
	const isLastLine = currentLineIndex === allLines.length - 1;
	const isEnterKey = key === "Enter";

	// 最終行での入力を検出
	// 最終行が空または1文字だけの場合も特別処理
	const lastLineContent = isLastLine ? lines[currentLineIndex] : "";
	const isFirstCharInLastLine = isLastLine && lastLineContent.length <= 1;
	const isEmptyLastLine = isLastLine && lastLineContent.length === 0;
	const isFirstChar = text.length === 1;

	// 以下の場合、スクロールを最大まで設定
	// 1. 最終行である場合
	// 2. テキスト全体が1文字だけの場合
	// 3. 最終行が空または1文字だけの場合（入力開始時）
	if (isLastLine || isFirstChar || isFirstCharInLastLine || isEmptyLastLine) {
		textarea.scrollTop = textarea.scrollHeight - textarea.clientHeight;
		return;
	}

	// 最終行でエンターキーが押された場合も最大スクロール
	if (isEnterKey && currentLineIndex === allLines.length - 2) {
		textarea.scrollTop = textarea.scrollHeight - textarea.clientHeight;
		return;
	}

	// 通常のスクロール調整
	if (caretY + lineHeight > scrollTop + clientHeight - paddingBottom) {
		textarea.scrollTop = caretY + lineHeight - clientHeight + paddingBottom;
	}
};

/**
 * 2つのペイン間のスクロール同期を実行する
 *
 * @param source - スクロール元の要素
 * @param target - スクロール先の要素
 * @param onBeforeSync - 同期開始前に実行されるコールバック
 * @param onAfterSync - 同期終了後に実行されるコールバック（タイムアウト付き）
 * @param timeoutMs - スクロールロック解除までの時間（ミリ秒）
 */
export const syncScroll = (
	source: HTMLElement,
	target: HTMLElement,
	onBeforeSync?: () => void,
	onAfterSync?: () => void,
	timeoutMs = 50,
): void => {
	if (onBeforeSync) {
		onBeforeSync();
	}

	const percentage = getScrollPercentage(source);
	setScrollPercentage(target, percentage);

	if (onAfterSync) {
		// スクロールイベントのロックを解除するタイマー
		setTimeout(() => {
			onAfterSync();
		}, timeoutMs);
	}
};
