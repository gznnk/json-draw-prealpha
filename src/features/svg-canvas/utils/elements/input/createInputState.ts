// Import types.
import type { InputState } from "../../../types/state/elements/InputState";

// Import constants.
import { InputDefaultState } from "../../../constants/state/elements/InputDefaultState";

// Import utils.
import { newId } from "../../shapes/common/newId";

/**
 * Create Input state
 */
export const createInputState = ({ x, y }: { x: number; y: number }): InputState => ({
	...InputDefaultState,
	id: newId(),
	x,
	y,
});