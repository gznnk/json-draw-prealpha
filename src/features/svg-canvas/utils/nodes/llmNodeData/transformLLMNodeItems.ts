import type { Frame } from "../../../types/core/Frame";
import type { Diagram } from "../../../types/state/core/Diagram";
import { createLLMNodeInputFrame } from "./createLLMNodeInputFrame";

export const transformLLMNodeItems = (
	ownerFrame: Frame,
	items: Diagram[],
): Diagram[] => {
	if (items.length !== 2) {
		console.error("Invalid number of items");
		return items;
	}
	const input = items[1];

	return [
		items[0],
		{
			...input,
			...createLLMNodeInputFrame({
				...ownerFrame,
			}),
		},
	];
};
