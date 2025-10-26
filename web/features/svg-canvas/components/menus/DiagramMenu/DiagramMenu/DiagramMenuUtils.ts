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
 * Check if a value is a plain object (not an array or null).
 */
const isPlainObject = (value: unknown): value is Record<string, unknown> => {
	return (
		typeof value === "object" &&
		value !== null &&
		!Array.isArray(value) &&
		Object.getPrototypeOf(value) === Object.prototype
	);
};

/**
 * Merge nested configuration objects, keeping only properties that are true in all configs.
 *
 * @param configs - Array of configuration objects to merge
 * @returns Merged configuration with only commonly enabled properties
 */
const mergeNestedConfigs = (
	configs: Record<string, unknown>[],
): Record<string, unknown> => {
	if (configs.length === 0) {
		return {};
	}

	const result: Record<string, unknown> = {};
	const firstConfig = configs[0];

	for (const key in firstConfig) {
		const firstValue = firstConfig[key];

		// Check if this is a nested object
		if (isPlainObject(firstValue)) {
			// Collect nested objects from all configs
			const nestedConfigs: Record<string, unknown>[] = [];
			let allHaveNestedObject = true;

			for (const config of configs) {
				const value = config[key];
				if (isPlainObject(value)) {
					nestedConfigs.push(value);
				} else {
					allHaveNestedObject = false;
					break;
				}
			}

			// If all configs have this nested object, merge recursively
			if (allHaveNestedObject && nestedConfigs.length === configs.length) {
				const merged = mergeNestedConfigs(nestedConfigs);
				if (Object.keys(merged).length > 0) {
					result[key] = merged;
				}
			}
		}
		// Check if this is a boolean property
		else if (firstValue === true) {
			// Only include if all configs have this property set to true
			if (configs.every((config) => config[key] === true)) {
				result[key] = true;
			}
		}
	}

	return result;
};

/**
 * Get the common menu configuration for diagrams.
 * Only returns menu items that are enabled (true) for all diagram types.
 *
 * @param diagrams - Array of diagrams
 * @returns DiagramMenuConfig with only commonly enabled menu items set to true
 */
export const getCommonMenuConfig = (
	diagrams: Diagram[],
): DiagramMenuConfig => {
	const types = collectDiagramTypes(diagrams);

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

	return mergeNestedConfigs(menuConfigs) as DiagramMenuConfig;
};
