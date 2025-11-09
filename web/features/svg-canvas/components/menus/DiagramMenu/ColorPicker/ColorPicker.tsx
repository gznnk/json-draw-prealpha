import type React from "react";
import { memo } from "react";

import { DiagramMenuControl } from "../DiagramMenuControl";
import { ColorSelector } from "./ColorSelector";

/**
 * Props for the ColorPicker component.
 */
type ColorPickerProps = {
	color: string;
	onColorChange: (newColor: string) => void;
};

/**
 * ColorPicker component.
 * Wraps ColorSelector with DiagramMenuControl for use in diagram menus.
 */
const ColorPickerComponent: React.FC<ColorPickerProps> = ({
	color,
	onColorChange,
}) => {
	return (
		<DiagramMenuControl>
			<ColorSelector color={color} onChange={onColorChange} />
		</DiagramMenuControl>
	);
};

export const ColorPicker = memo(ColorPickerComponent);
