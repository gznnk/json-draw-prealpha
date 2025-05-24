// 共通型定義からContentTypeをインポート
import type { ContentType } from "../../types/ContentType";

/**
 * ContentContainerコンポーネントのプロパティ
 */
export type ContentContainerProps = {
	/** コンテンツの種類 */
	type?: ContentType;
	/** コンテンツの表示データ */
	content?: string;
	/** コンテンツのID */
	id?: string;
	/** コンテンツが変更された時のコールバック関数 */
	onChange?: (content: string) => void;
};
