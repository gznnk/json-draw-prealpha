/**
 * カスタムフック: new_workツールのイベントをリッスンするためのフック
 */
import { useEffect, useMemo } from "react";
import type { Work } from "../../model/Work";
import { EventBus } from "../../../shared/event-bus/EventBus";
import { NEW_WORK_EVENT } from "./constants";

/**
 * useTool フック - new_workツールのイベントをリッスンし、コールバックを実行する
 *
 * @param callback - new_workイベント発生時に呼び出されるコールバック関数
 * @returns EventBus - new_workイベントを発行するためのEventBusインスタンス
 */
export const useTool = (callback: (work: Work) => Promise<void>): EventBus => {
	// EventBusインスタンスをメモ化して保持
	const eventBus = useMemo(() => new EventBus(), []);

	useEffect(() => {
		// イベントリスナーを定義
		const handleNewWork = (event: CustomEvent) => {
			const workData = event.detail as Work;
			// 渡されたコールバック関数を実行
			callback(workData).catch((error) => {
				console.error("Error in new_work callback:", error);
			});
		};

		// EventBusにリスナーを登録
		eventBus.addEventListener(NEW_WORK_EVENT, handleNewWork);

		// クリーンアップ関数
		return () => {
			eventBus.removeEventListener(NEW_WORK_EVENT, handleNewWork);
		};
	}, [callback, eventBus]);

	// EventBusインスタンスを返却
	return eventBus;
};
