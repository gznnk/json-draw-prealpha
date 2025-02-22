// 座標系に関する型定義

/**
 * 座標（x,y）の型定義
 */
export type Point = {
	x: number;
	y: number;
};

/**
 * ドラッグ方向の型定義
 */
export enum DragDirection {
	All = "all",
	Horizontal = "horizontal",
	Vertical = "vertical",
}
