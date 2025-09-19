import { useState, useCallback } from "react";

import type { Conversation } from "../models/Conversation";
import { createConversationRepository } from "../repository/conversation/factory";
import type { ConversationRepository } from "../repository/conversation/interface";
import type { LLMProvider } from "../types/LLMProvider";

// Create repository instance
const conversationRepository: ConversationRepository =
	createConversationRepository();

/**
 * Helper to generate a unique conversation ID
 *
 * @returns New unique ID
 */
const generateConversationId = (): string => {
	return `conversation_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
};

/**
 * Custom hook for managing and persisting conversations
 *
 * @returns Object containing the conversation array and operations
 */
export const useConversation = () => {
	// Manage conversation array state
	const [conversations, setConversations] = useState<Conversation[]>([]);

	/**
	 * Function to create a new conversation
	 *
	 * @param workId - Associated work ID
	 * @param provider - LLM provider
	 * @param initialMessages - Optional initial messages
	 * @returns Created conversation
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
	 * Function to update a conversation
	 *
	 * @param conversation - Conversation to update
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
	 * Function to delete a conversation
	 *
	 * @param id - ID of the conversation to remove
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
	 * Delete all conversations associated with the given Work ID
	 *
	 * @param workId - Target Work ID
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
	 * Get all conversations associated with a Work ID
	 *
	 * @param workId - Work ID to filter by
	 * @returns Array of conversations for the given Work ID
	 */
	const getConversationsByWorkId = useCallback(
		(workId: string): Conversation[] => {
			try {
				// Retrieve directly from local storage
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
	 * Update an existing conversation or create a new one
	 *
	 * @param workId - Associated work ID
	 * @param provider - LLM provider
	 * @param messages - Message array
	 * @returns The updated or newly created conversation
	 */
	const saveOrUpdateConversation = useCallback(
		async (
			workId: string,
			provider: LLMProvider,
			messages: unknown[],
		): Promise<Conversation> => {
			try {
				// Get existing conversations
				const existingConversations = getConversationsByWorkId(workId);

				if (existingConversations.length > 0) {
					// Update the most recent conversation
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

				// Create a new conversation
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
