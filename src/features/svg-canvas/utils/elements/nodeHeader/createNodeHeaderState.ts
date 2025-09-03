// Import types.
import type { NodeHeaderState } from "../../../types/state/elements/NodeHeaderState";

// Import constants.
import { NodeHeaderDefaultState } from "../../../constants/state/elements/NodeHeaderDefaultState";

// Import utils.
import { newId } from "../../shapes/common/newId";

/**
 * Create NodeHeader state
 */
export const createNodeHeaderState = ({
	x,
	y,
	text = "Chat Area",
}: { x: number; y: number; text?: string }): NodeHeaderState => ({
	...NodeHeaderDefaultState,
	id: newId(),
	x,
	y,
	text,
});