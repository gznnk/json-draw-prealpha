import type { DiagramType } from "./DiagramType";

/**
 * 図形の基本データ
 */
export type DiagramBaseData = {
	id: string;
	type: DiagramType;
	x: number;
	y: number;
	syncWithSameId?: boolean; // 永続化されないプロパティ TODO: 永続化されるプロパティと分ける
};
