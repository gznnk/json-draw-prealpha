import type React from "react";
import { memo, useEffect, useState } from "react";

// Import styled components
import { DiagramMenuControl } from "../DiagramMenuControl";
import { PRESET_COLORS } from "./ColorPickerConstants";
import {
	ColorGrid,
	ColorInput,
	ColorPickerContainer,
	ColorSwatch,
} from "./ColorPickerStyled";

/**
 * Props for the ColorPicker component.
 */
type ColorPickerProps = {
	color: string;
	onColorChange: (newColor: string) => void;
};

/**
 * ColorPicker component.
 */
const ColorPickerComponent: React.FC<ColorPickerProps> = ({
	color,
	onColorChange,
}) => {
	const [inputValue, setInputValue] = useState(color);
	const [isValid, setIsValid] = useState(true);

	const handleColorClick = (selectedColor: string) => {
		onColorChange(selectedColor);
	};

	const handleHexInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const val = event.target.value;
		setInputValue(val);

		const valid = CSS.supports("color", val);
		setIsValid(valid);

		if (valid) {
			onColorChange(val);
		}
	};

	useEffect(() => {
		setInputValue(color);
	}, [color]);

	return (
		<DiagramMenuControl>
			<ColorPickerContainer>
				<ColorGrid>
					{PRESET_COLORS.map((c) => (
						<ColorSwatch
							key={c}
							color={c}
							selected={c.toLowerCase() === color.toLowerCase()}
							onClick={() => handleColorClick(c)}
						/>
					))}
				</ColorGrid>
				<ColorInput
					value={inputValue}
					onChange={handleHexInputChange}
					maxLength={32}
					placeholder="CSS color"
					isValid={isValid}
				/>
			</ColorPickerContainer>
		</DiagramMenuControl>
	);
};

export const ColorPicker = memo(ColorPickerComponent);
