import type { Shape } from "../base/Shape";

/**
 * 変形可能な図形のデータ
 */
export type TransformativeData = Shape & {
	keepProportion: boolean;
};
