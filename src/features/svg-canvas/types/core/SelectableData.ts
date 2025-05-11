/**
 * Interface for diagram elements that can be selected by the user.
 * Provides properties to track selection state and multi-selection behavior.
 */
export type SelectableData = {
	isSelected: boolean;
	isMultiSelectSource: boolean; // Indicates if this is the source element in a multi-selection
};
