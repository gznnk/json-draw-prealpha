/**
 * 関数コールの情報を表す型定義.
 * AIによる関数呼び出し要求を定義します.
 */
export type FunctionCallInfo = {
	/**
	 * 呼び出される関数の名前.
	 */
	name: string;

	/**
	 * 関数に渡される引数.
	 */
	arguments: unknown;

	/**
	 * 関数呼び出しの一意識別子.
	 */
	callId: string;
};

/**
 * 関数コールのハンドラ関数の型.
 * @param functionCall - 処理する関数コール情報
 * @returns 関数の戻り値（JSON文字列変換可能なオブジェクト）またはnullまたはPromise
 */
export type FunctionCallHandler = (
	functionCall: FunctionCallInfo,
) => Promise<Record<string, unknown> | null> | Record<string, unknown> | null;

/**
 * 関数名とハンドラのマップ型定義.
 * 関数名をキーとして、対応するハンドラ関数を値として持ちます.
 */
export type FunctionHandlerMap = Record<string, FunctionCallHandler>;

/**
 * ツールパラメータの定義.
 */
export type ToolParameter = {
	name: string;
	type: string;
	description: string;
	enum?: string[];
};

/**
 * LLMで使用可能なツールの定義.
 */
export type ToolDefinition = {
	name: string;
	description: string;
	parameters: ToolParameter[];
};

/**
 * LLMクライアントの初期化オプション.
 * 全てのLLMプロバイダーで共通して使用される設定項目.
 */
export type LLMClientOptions = {
	/**
	 * 利用可能なツール定義のリスト.
	 */
	tools?: ToolDefinition[];

	/**
	 * システムプロンプト.
	 */
	systemPrompt?: string;

	/**
	 * 関数名とハンドラのマッピング.
	 */
	functionHandlers?: FunctionHandlerMap;

	/**
	 * 初期メッセージリスト（以前の会話を復元する場合）.
	 * プロバイダー固有の形式のメッセージを受け取ります.
	 */
	initialMessages?: unknown[];

	/**
	 * 関数コールの最大試行回数. デフォルトは10.
	 */
	maxAttempts?: number;
};
