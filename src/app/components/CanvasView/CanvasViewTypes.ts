import type { SvgCanvasData } from "../../../features/svg-canvas/canvas/SvgCanvasTypes";

/**
 * CanvasViewコンポーネントのプロパティ定義
 * 親コンポーネントからキャンバスデータを受け取る
 */
export type CanvasViewProps = {
	/** キャンバスの表示データ */
	content: SvgCanvasData;
	/** コンポーネントの一意識別子（省略可能） */
	id?: string;

	onDataChange?: (data: SvgCanvasData) => void;
};
