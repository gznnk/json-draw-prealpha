import { useState, useCallback } from "react";
import type { Conversation } from "../models/Conversation";
import type { LLMProvider } from "../types/LLMProvider";
import { createConversationRepository } from "../repository/conversation/factory";
import type { ConversationRepository } from "../repository/conversation/interface";

// リポジトリインスタンスの生成
const conversationRepository: ConversationRepository =
	createConversationRepository();

/**
 * 会話の一意IDを生成するヘルパー関数.
 *
 * @returns 新しい一意ID
 */
const generateConversationId = (): string => {
	return `conversation_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
};

/**
 * useConversationフック - 会話の管理と永続化を行うカスタムフック
 *
 * @returns 会話配列と操作関数を含むオブジェクト
 */
export const useConversation = () => {
	// 会話配列のstate管理
	const [conversations, setConversations] = useState<Conversation[]>([]);

	/**
	 * 新しい会話を作成する関数.
	 *
	 * @param workId - 紐づけるWorkのID
	 * @param provider - LLMプロバイダー
	 * @param initialMessages - 初期メッセージ配列（オプション）
	 * @returns 作成された会話
	 */
	const createConversation = useCallback(
		async (
			workId: string,
			provider: LLMProvider,
			initialMessages: unknown[] = [],
		): Promise<Conversation> => {
			const newConversation: Conversation = {
				id: generateConversationId(),
				workId,
				provider,
				messages: initialMessages,
				createdAt: new Date(),
			};

			try {
				await conversationRepository.saveConversation(newConversation);
				setConversations((prev) => [...prev, newConversation]);
				return newConversation;
			} catch (error) {
				console.error("Failed to create conversation:", error);
				throw error;
			}
		},
		[],
	);

	/**
	 * 会話を更新する関数.
	 *
	 * @param conversation - 更新する会話
	 */
	const updateConversation = useCallback(
		async (conversation: Conversation): Promise<void> => {
			try {
				await conversationRepository.saveConversation(conversation);
				setConversations((prev) =>
					prev.map((c) => (c.id === conversation.id ? conversation : c)),
				);
			} catch (error) {
				console.error("Failed to update conversation:", error);
				throw error;
			}
		},
		[],
	);

	/**
	 * 会話を削除する関数.
	 *
	 * @param id - 削除する会話のID
	 */
	const deleteConversation = useCallback(async (id: string): Promise<void> => {
		try {
			await conversationRepository.deleteConversation(id);
			setConversations((prev) =>
				prev.filter((conversation) => conversation.id !== id),
			);
		} catch (error) {
			console.error("Failed to delete conversation:", error);
			throw error;
		}
	}, []);

	/**
	 * 指定したWorkIDに紐づく全ての会話を削除する関数.
	 *
	 * @param workId - 削除対象のWorkID
	 */
	const deleteConversationsByWorkId = useCallback(
		async (workId: string): Promise<void> => {
			try {
				await conversationRepository.deleteConversationsByWorkId(workId);
				setConversations((prev) =>
					prev.filter((conversation) => conversation.workId !== workId),
				);
			} catch (error) {
				console.error("Failed to delete conversations by work ID:", error);
				throw error;
			}
		},
		[],
	); /**
	 * 指定したWorkIDに紐づく会話を取得する関数.
	 *
	 * @param workId - フィルタリングするWorkID
	 * @returns 指定したWorkIDに紐づく会話配列
	 */
	const getConversationsByWorkId = useCallback(
		(workId: string): Conversation[] => {
			try {
				// ローカルストレージから直接取得
				const allConversations =
					conversationRepository.getConversationsByWorkIdSync(workId);
				console.log(
					`Retrieved ${allConversations.length} conversations from storage for work ${workId}:`,
					allConversations,
				);
				return allConversations;
			} catch (error) {
				console.error("Failed to get conversations by work ID:", error);
				return [];
			}
		},
		[],
	);

	/**
	 * 既存の会話を更新するか、新しい会話を作成する関数.
	 *
	 * @param workId - 紐づけるWorkのID
	 * @param provider - LLMプロバイダー
	 * @param messages - メッセージ配列
	 * @returns 更新または作成された会話
	 */
	const saveOrUpdateConversation = useCallback(
		async (
			workId: string,
			provider: LLMProvider,
			messages: unknown[],
		): Promise<Conversation> => {
			try {
				// 既存の会話を取得
				const existingConversations = getConversationsByWorkId(workId);

				if (existingConversations.length > 0) {
					// 最新の会話を更新
					const latestConversation = existingConversations.sort(
						(a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
					)[0];

					const updatedConversation: Conversation = {
						...latestConversation,
						messages,
						provider,
					};

					console.log(
						`Updating existing conversation ${latestConversation.id} for work ${workId}`,
					);
					await updateConversation(updatedConversation);
					return updatedConversation;
				}

				// 新しい会話を作成
				console.log(`Creating new conversation for work ${workId}`);
				return await createConversation(workId, provider, messages);
			} catch (error) {
				console.error("Failed to save or update conversation:", error);
				throw error;
			}
		},
		[getConversationsByWorkId, updateConversation, createConversation],
	);

	return {
		conversations,
		createConversation,
		updateConversation,
		saveOrUpdateConversation,
		deleteConversation,
		deleteConversationsByWorkId,
		getConversationsByWorkId,
	};
};
