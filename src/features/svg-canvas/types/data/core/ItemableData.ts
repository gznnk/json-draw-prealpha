/**
 * Interface for diagram elements that can contain child elements.
 * Used for composite elements like groups that can hold other diagrams.
 *
 * Note: Using type parameter T to avoid circular references.
 */
export type ItemableData<T = unknown> = {
	items: T[];
};
