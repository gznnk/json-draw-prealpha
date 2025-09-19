import type { SelectableState } from "../../../types/state/core/SelectableState";

export const SelectableDefaultState = {
	isSelected: false,
	isAncestorSelected: false,
	showOutline: false,
} as const satisfies SelectableState;
