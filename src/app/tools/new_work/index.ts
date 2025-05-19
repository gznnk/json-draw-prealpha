import { definition } from "./definition";
import { createHandler } from "./handler";
import { useTool } from "./hooks";

/**
 * new_workツールの定義とユーティリティをまとめたオブジェクト
 * - definition: ツールの定義
 * - createHandler: EventBusを受け取りハンドラーを生成する関数
 * - useTool: ツールのイベントをリッスンするフック
 */
export const newWork = {
	definition,
	createHandler,
	useTool,
};
