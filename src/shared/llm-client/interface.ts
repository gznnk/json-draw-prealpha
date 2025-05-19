/**
 * チャット送信時のパラメータ型定義.
 * 自然言語チャンクを処理するためのコールバック関数を含みます.
 */
export type ChatParams = {
	/**
	 * ユーザーの入力メッセージ.
	 */
	message: string;

	/**
	 * 自然言語チャンクを受け取るコールバック関数.
	 * @param textChunk - 受信したテキストチャンク
	 */
	onTextChunk: (textChunk: string) => void;
};

/**
 * LLMクライアントのインタフェース.
 * LLMとの通信を行うためのメソッドを定義します.
 */
export interface LLMClient {
	/**
	 * ユーザーメッセージを送信し、応答を非同期に処理します.
	 * @param params - チャットパラメータ
	 */
	chat(params: ChatParams): Promise<void>;

	/**
	 * 現在の会話履歴を削除します.
	 */
	clearConversation(): void;
}
