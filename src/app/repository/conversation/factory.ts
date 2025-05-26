import type { ConversationRepository } from "./interface";
import { LocalStorageConversationRepository } from "./localStorageImpl";

/**
 * Creates and returns a ConversationRepository implementation.
 * Currently returns a localStorage-based implementation.
 *
 * @returns A ConversationRepository instance
 */
export const createConversationRepository = (): ConversationRepository => {
	return new LocalStorageConversationRepository();
};
