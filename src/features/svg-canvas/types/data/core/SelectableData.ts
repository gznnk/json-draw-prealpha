/**
 * Interface for diagram elements that can be selected by the user.
 * Provides properties to track selection state and multi-selection behavior.
 */
export type SelectableData = {
	isSelected: boolean;
	isAncestorSelected?: boolean;
	showOutline: boolean; // Shows outline for various states (parent group selected, area selection, etc.)
};
