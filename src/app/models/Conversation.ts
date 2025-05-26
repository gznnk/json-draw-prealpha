import type { LLMProvider } from "../types/LLMProvider";

/**
 * 会話のモデル.
 * WorkとLLMクライアントの会話を紐づけて管理します.
 */
export type Conversation = {
	/**
	 * 会話の一意識別子.
	 */
	id: string;

	/**
	 * 紐づけられるWorkのID.
	 */
	workId: string;
	/**
	 * LLMプロバイダーの種別.
	 */
	provider: LLMProvider;

	/**
	 * 会話のメッセージリスト.
	 * プロバイダー固有の形式のメッセージを保存します.
	 */
	messages: unknown[];

	/**
	 * 会話の作成日時.
	 */
	createdAt: Date;
};
