/**
 * カスタムフック: new_workツールのイベントをリッスンするためのフック
 */
import { useEffect } from "react";
import type { Work } from "../../model/Work";
import { newWorkEventBus } from "./handler";
import { NEW_WORK_EVENT } from "./constants";

/**
 * useNewWorkフック - new_workツールのイベントをリッスンし、コールバックを実行する
 *
 * @param callback - new_workイベント発生時に呼び出されるコールバック関数
 */
export const useNewWork = (callback: (work: Work) => Promise<void>): void => {
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
		newWorkEventBus.addEventListener(NEW_WORK_EVENT, handleNewWork);

		// クリーンアップ関数
		return () => {
			newWorkEventBus.removeEventListener(NEW_WORK_EVENT, handleNewWork);
		};
	}, [callback]);
};
