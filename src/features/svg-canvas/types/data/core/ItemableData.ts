// 循環参照を避けるため、Diagramの直接インポートを削除

/**
 * Interface for diagram elements that can contain child elements.
 * Used for composite elements like groups that can hold other diagrams.
 *
 * Note: 型パラメータTを使用して循環参照を避けています。
 */
export type ItemableData<T = unknown> = {
	items: T[];
};
