// Import types.
import type { LLMNodeState } from "../../../types/state/nodes/LLMNodeState";

// Import utils.
import { createInputState } from "../../elements/input/createInputState";
import { createNodeHeaderState } from "../../elements/nodeHeader/createNodeHeaderState";
import { degreesToRadians } from "../../math/common/degreesToRadians";
import { affineTransformation } from "../../math/transform/affineTransformation";
import { newId } from "../../shapes/common/newId";
import { createRectangleConnectPoint } from "../../shapes/rectangle/createRectangleConnectPoint";
import { createLLMNodeInputFrame } from "./createLLMNodeInputFrame";

import {
	HEADER_HEIGHT,
	HEADER_MARGIN_TOP,
} from "../../../components/nodes/LLMNode/LLMNodeConstants";
// Import constants.
import { LLMNodeDefaultState } from "../../../constants/state/nodes/LLMNodeDefaultState";

/**
 * Creates state for an LLM node with specified properties.
 *
 * @param x - The x coordinate of the node
 * @param y - The y coordinate of the node
 * @param width - Optional width of the node
 * @param height - Optional height of the node
 * @param rotation - Optional rotation of the node
 * @param scaleX - Optional x scale of the node
 * @param scaleY - Optional y scale of the node
 * @returns LLM node state object
 */
export const createLLMNodeState = ({
	x,
	y,
	width = LLMNodeDefaultState.width,
	height = LLMNodeDefaultState.height,
	rotation = 0,
	scaleX = 1,
	scaleY = 1,
	text = "",
}: {
	x: number;
	y: number;
	width?: number;
	height?: number;
	rotation?: number;
	scaleX?: number;
	scaleY?: number;
	text?: string;
}) => {
	const connectPoints = createRectangleConnectPoint({
		x,
		y,
		width,
		height,
		rotation,
		scaleX,
		scaleY,
	});

	// Calculate dimensions and positions for child elements
	const headerCenter = affineTransformation(
		0,
		-(height / 2 - (HEADER_HEIGHT / 2 + HEADER_MARGIN_TOP)),
		scaleX,
		scaleY,
		degreesToRadians(rotation),
		x,
		y,
	);

	const inputFrame = createLLMNodeInputFrame({
		x,
		y,
		width,
		height,
		rotation,
		scaleX,
		scaleY,
	});

	const state = {
		...LLMNodeDefaultState,
		id: newId(),
		x,
		y,
		width,
		height,
		rotation,
		scaleX,
		scaleY,
		items: [
			createNodeHeaderState({
				x: headerCenter.x,
				y: headerCenter.y,
				text: "LLM",
			}),
			{
				...createInputState({
					x: inputFrame.x,
					y: inputFrame.y,
					width: inputFrame.width,
					height: inputFrame.height,
					rotation: inputFrame.rotation,
					scaleX: inputFrame.scaleX,
					scaleY: inputFrame.scaleY,
					text,
					verticalAlign: "top",
				}),
			},
		],
		connectPoints,
	} as LLMNodeState;

	return state;
};
