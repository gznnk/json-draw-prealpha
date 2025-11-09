import { DiagramRegistry } from "../../../../registry/DiagramRegistry";
import type { DiagramMenuConfig } from "../../../../types/menu/DiagramMenuConfig";
import type { Diagram } from "../../../../types/state/core/Diagram";
import { collectDiagramTypes } from "../../../../utils/core/collectDiagramTypes";
import { isFillableState } from "../../../../utils/validation/isFillableState";
import { isItemableState } from "../../../../utils/validation/isItemableState";
import { isStrokableState } from "../../../../utils/validation/isStrokableState";
import { isTextableState } from "../../../../utils/validation/isTextableState";

export const findFirstFillableRecursive = (
	items: Diagram[],
): Diagram | undefined => {
	for (const item of items) {
		if (isFillableState(item)) {
			return item;
		}
		if (isItemableState(item)) {
			const foundItem = findFirstFillableRecursive(item.items);
			if (foundItem) {
				return foundItem;
			}
		}
	}
	return undefined;
};

export const findFirstStrokableRecursive = (
	items: Diagram[],
): Diagram | undefined => {
	for (const item of items) {
		if (isStrokableState(item)) {
			return item;
		}
		if (isItemableState(item)) {
			const foundItem = findFirstStrokableRecursive(item.items);
			if (foundItem) {
				return foundItem;
			}
		}
	}
	return undefined;
};

export const findFirstRectangleRecursive = (
	items: Diagram[],
): Diagram | undefined => {
	for (const item of items) {
		if (item.type === "Rectangle") {
			return item;
		}
		if (isItemableState(item)) {
			const foundItem = findFirstRectangleRecursive(item.items);
			if (foundItem) {
				return foundItem;
			}
		}
	}
	return undefined;
};

export const findFirstCornerRoundableRecursive = (
	items: Diagram[],
): Diagram | undefined => {
	for (const item of items) {
		if ("cornerRadius" in item) {
			return item;
		}
		if (isItemableState(item)) {
			const foundItem = findFirstCornerRoundableRecursive(item.items);
			if (foundItem) {
				return foundItem;
			}
		}
	}
	return undefined;
};

export const findFirstTextableRecursive = (
	items: Diagram[],
): Diagram | undefined => {
	for (const item of items) {
		if (isTextableState(item)) {
			return item;
		}
		if (isItemableState(item)) {
			const foundItem = findFirstTextableRecursive(item.items);
			if (foundItem) {
				return foundItem;
			}
		}
	}
	return undefined;
};

export const findFirstPathableRecursive = (
	items: Diagram[],
): Diagram | undefined => {
	for (const item of items) {
		if ("pathType" in item) {
			return item;
		}
		if (isItemableState(item)) {
			const foundItem = findFirstPathableRecursive(item.items);
			if (foundItem) {
				return foundItem;
			}
		}
	}
	return undefined;
};

/**
 * Merge a boolean property: only include if all configs have it set to true.
 */
const mergeBooleanProperty = (
	configs: DiagramMenuConfig[],
	key: keyof DiagramMenuConfig,
): boolean | undefined => {
	// Check if all configs have this property set to true
	const allTrue = configs.every((config) => config[key] === true);
	return allTrue ? true : undefined;
};

/**
 * Merge borderStyle property: only include if all configs have it,
 * and merge nested properties individually.
 */
const mergeBorderStyle = (
	configs: DiagramMenuConfig[],
): { radius?: boolean } | undefined => {
	// Check if all configs have borderStyle
	const allHaveBorderStyle = configs.every(
		(config) =>
			config.borderStyle !== undefined &&
			typeof config.borderStyle === "object",
	);

	if (!allHaveBorderStyle) {
		return undefined;
	}

	// Merge radius property: true if all configs have it set to true, false otherwise
	const allHaveRadius = configs.every(
		(config) => config.borderStyle?.radius === true,
	);

	return {
		radius: allHaveRadius,
	};
};

/**
 * Get the common menu configuration for diagrams.
 * Only returns menu items that are enabled (true) for all diagram types.
 * Each menu property is merged individually with its own merge logic.
 *
 * @param diagrams - Array of diagrams
 * @returns DiagramMenuConfig with only commonly enabled menu items set to true
 */
export const getCommonMenuConfig = (diagrams: Diagram[]): DiagramMenuConfig => {
	const types = collectDiagramTypes(diagrams);
	types.delete("Group"); // Exclude Group type

	if (types.size === 0) {
		return {};
	}

	const menuConfigs: DiagramMenuConfig[] = [];
	for (const type of types) {
		const config = DiagramRegistry.getMenuConfig(type);
		if (config) {
			menuConfigs.push(config);
		}
	}

	if (menuConfigs.length === 0) {
		return {};
	}

	// Merge each property individually in the same loop
	const result: DiagramMenuConfig = {};

	// Merge backgroundColor
	const backgroundColor = mergeBooleanProperty(menuConfigs, "backgroundColor");
	if (backgroundColor !== undefined) {
		result.backgroundColor = backgroundColor;
	}

	// Merge borderColor
	const borderColor = mergeBooleanProperty(menuConfigs, "borderColor");
	if (borderColor !== undefined) {
		result.borderColor = borderColor;
	}

	// Merge borderStyle (nested object with special handling)
	const borderStyle = mergeBorderStyle(menuConfigs);
	if (borderStyle !== undefined) {
		result.borderStyle = borderStyle;
	}

	// Merge borderRadius
	const borderRadius = mergeBooleanProperty(menuConfigs, "borderRadius");
	if (borderRadius !== undefined) {
		result.borderRadius = borderRadius;
	}

	// Merge arrowHead
	const arrowHead = mergeBooleanProperty(menuConfigs, "arrowHead");
	if (arrowHead !== undefined) {
		result.arrowHead = arrowHead;
	}

	// Merge lineStyle
	const lineStyle = mergeBooleanProperty(menuConfigs, "lineStyle");
	if (lineStyle !== undefined) {
		result.lineStyle = lineStyle;
	}

	// Merge fontStyle
	const fontStyle = mergeBooleanProperty(menuConfigs, "fontStyle");
	if (fontStyle !== undefined) {
		result.fontStyle = fontStyle;
	}

	// Merge textAlignment
	const textAlignment = mergeBooleanProperty(menuConfigs, "textAlignment");
	if (textAlignment !== undefined) {
		result.textAlignment = textAlignment;
	}

	// aspectRatio is not merged here - it's always undefined
	// Display control is handled in DiagramMenu based on single/multi selection
	// Active/inactive state is determined in KeepAspectRatioMenu itself
	result.aspectRatio = undefined;

	return result;
};
