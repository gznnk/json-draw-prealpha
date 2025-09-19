import { ButtonFeatures } from "../../../types/data/elements/ButtonData";
import type { ButtonState } from "../../../types/state/elements/ButtonState";
import { ButtonDefaultData } from "../../data/elements/ButtonDefaultData";
import { CreateDefaultState } from "../shapes/CreateDefaultState";

/**
 * Default state values for Button
 */
export const ButtonDefaultState: ButtonState = CreateDefaultState<ButtonState>({
	type: "Button",
	options: ButtonFeatures,
	baseData: ButtonDefaultData,
	properties: {
		width: 88,
		height: 32,
		cornerRadius: 6,
		fill: "#1677ff",
		stroke: "#1677ff",
		strokeWidth: "1px",
		fontSize: 14,
		fontColor: "#ffffff",
		fontWeight: "normal",
		fontFamily: "Segoe UI",
		textAlign: "center",
		verticalAlign: "center",
		textType: "text",
	},
});
