import type { DiagramTransformEvent } from "../events";

/**
 * 変形可能な図形のプロパティ
 */
export type TransformativeProps = {
	onTransform?: (e: DiagramTransformEvent) => void;
};
