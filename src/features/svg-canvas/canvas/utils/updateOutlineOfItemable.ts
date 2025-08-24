// Import types.
import type { Diagram } from "../../types/state/catalog/Diagram";

// Import utils.
import { calcItemableOrientedBox } from "../../utils/core/calcItemableOrientedBox";
import { isItemableState } from "../../utils/validation/isItemableState";

/**
 * Update the outline of an itemable diagram and its child itemables recursively.
 * Calculates the bounding box based on the itemable's items and updates the itemable's dimensions.
 * Note: ConnectLine types are excluded from outline updates as they have different boundary calculation logic.
 *
 * @param itemable - The itemable diagram to update.
 * @returns {Diagram} - The updated itemable diagram with outline updated.
 */
export const updateOutlineOfItemable = (itemable: Diagram): Diagram => {
	if (!isItemableState(itemable)) {
		return itemable;
	}

	// Calculate the bounds of the itemable.
	const box = calcItemableOrientedBox(itemable);

	// Update child itemables recursively
	let updatedItems = itemable.items;
	let itemsChanged = false;

	if (itemable.items) {
		const newItems = itemable.items.map((item) => {
			if (isItemableState(item)) {
				const updatedItem = updateOutlineOfItemable(item);
				if (updatedItem !== item) {
					itemsChanged = true;
				}
				return updatedItem;
			}
			return item;
		});

		if (itemsChanged) {
			updatedItems = newItems;
		}
	}

	// Check if bounds changed
	const boundsChanged =
		itemable.x !== box.x ||
		itemable.y !== box.y ||
		itemable.width !== box.width ||
		itemable.height !== box.height;

	// If nothing changed, return the original object
	if (!boundsChanged && !itemsChanged) {
		return itemable;
	}

	// Return the new object with updated bounds and items
	return {
		...itemable,
		x: box.x,
		y: box.y,
		width: box.width,
		height: box.height,
		items: updatedItems,
	};
};
