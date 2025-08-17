// Import types.
import type { PageDesignNodeState } from "../../../types/state/nodes/PageDesignNodeState";

// Import utils.
import { newId } from "../../shapes/common/newId";
import { createRectangleConnectPoint } from "../../shapes/rectangle/createRectangleConnectPoint";

// Import constants.
import { PageDesignNodeDefaultState } from "../../../constants/state/nodes/PageDesignNodeDefaultState";

export const createPageDesignNodeState = ({
	x,
	y,
}: {
	x: number;
	y: number;
}) => {
	const connectPoints = createRectangleConnectPoint({
		x,
		y,
		width: PageDesignNodeDefaultState.width,
		height: PageDesignNodeDefaultState.height,
		rotation: PageDesignNodeDefaultState.rotation,
		scaleX: PageDesignNodeDefaultState.scaleX,
		scaleY: PageDesignNodeDefaultState.scaleY,
	});

	return {
		...PageDesignNodeDefaultState,
		id: newId(),
		x,
		y,
		connectPoints,
	} as PageDesignNodeState;
};
