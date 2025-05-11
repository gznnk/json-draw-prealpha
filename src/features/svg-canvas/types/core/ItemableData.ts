import type { Diagram } from "../DiagramCatalog"; // TODO: 依存関係を解消する

/**
 * 子図形をもつ図形のデータ
 */
export type ItemableData = {
	items: Diagram[];
};
