// Import interfaces and types
import type { LLMClient } from "./interface";
import type { ToolDefinition, FunctionHandlerMap } from "./types";
import { OpenAIClient } from "./openai/client";

/**
 * Factory functions for creating LLM clients.
 * Provides extensibility for supporting different LLM providers in the future.
 */
export const LLMClientFactory = {
	/**
	 * Creates an OpenAI-based LLM client.
	 *
	 * @param apiKey - OpenAI API key
	 * @param options - Initialization options
	 * @returns OpenAI-based LLM client instance
	 */
	createOpenAIClient(
		apiKey: string,
		options?: {
			tools?: ToolDefinition[];
			systemPrompt?: string;
			functionHandlers?: FunctionHandlerMap;
		},
	): LLMClient {
		return new OpenAIClient(apiKey, options);
	},

	/**
	 * Creates the default LLM client.
	 * Currently returns the OpenAI client as the default.
	 *
	 * @param apiKey - LLM provider API key
	 * @param options - Initialization options
	 * @returns Default LLM client instance
	 */
	createClient(
		apiKey: string,
		options?: {
			tools?: ToolDefinition[];
			systemPrompt?: string;
			functionHandlers?: FunctionHandlerMap;
		},
	): LLMClient {
		// Currently, OpenAI is the default implementation.
		// In the future, this can be extended to return the appropriate implementation
		// based on environment variables or configuration.
		return LLMClientFactory.createOpenAIClient(apiKey, options);
	},
};
