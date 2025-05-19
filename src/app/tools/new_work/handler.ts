/**
 * Handles the creation of a new work.
 * Creates a work with the specified name and dispatches the corresponding event.
 *
 * @param eventBus - EventBus instance for dispatching work creation events
 * @returns A function handler that processes function calls and dispatches events
 */
import type {
	FunctionCallHandler,
	FunctionCallInfo,
} from "../../../shared/llm-client/types";
import type { EventBus } from "../../../shared/event-bus/EventBus";
import { NEW_WORK_EVENT } from "./constants";

/**
 * ハンドラーを作成する関数
 * EventBusを受け取り、FunctionCallHandlerを返す
 *
 * @param eventBus - イベントを発行するためのEventBusインスタンス
 * @returns 関数呼び出しを処理するハンドラー
 */
export const createHandler = (eventBus: EventBus): FunctionCallHandler => {
	// 実際のハンドラー関数を返す
	return (functionCall: FunctionCallInfo) => {
		const args = functionCall.arguments as { work_name: string };

		if (typeof args.work_name === "string") {
			const id = crypto.randomUUID();

			// Create work data
			const workData = {
				id,
				name: args.work_name,
				// デフォルトのタイプとパス
				type: "markdown",
				path: args.work_name,
			};

			// Dispatch event via provided EventBus
			eventBus.dispatchEvent(
				new CustomEvent(NEW_WORK_EVENT, {
					detail: workData,
				}),
			);

			return {
				id,
				work_name: args.work_name,
			};
		}

		return null;
	};
};

// ランタイムでハンドラーが初期化される前にエラーを防ぐためのダミー実装
// index.tsでは実際のEventBusを使用して上書きされる
export const handler: FunctionCallHandler = () => null;
