import type { Shape } from "./Shape";

/**
 * 変形可能な図形のデータ
 */
export type TransformativeData = Shape & {
	keepProportion: boolean;
};
