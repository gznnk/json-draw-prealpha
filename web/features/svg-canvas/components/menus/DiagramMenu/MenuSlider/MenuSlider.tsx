import type React from "react";
import { memo, useEffect, useState } from "react";

import {
	MenuSliderWrapper,
	MenuSliderInput,
	MenuSliderFooter,
	MenuSliderLabel,
	MenuSliderNumberInput,
} from "./MenuSliderStyled";

/**
 * Props for the MenuSlider component.
 */
type MenuSliderProps = {
	value: number;
	min?: number;
	max?: number;
	onChange: (newValue: number) => void;
};

/**
 * MenuSlider component.
 * A UI control for adjusting values using a slider.
 */
const MenuSliderComponent: React.FC<MenuSliderProps> = ({
	value,
	min = 1,
	max = 100,
	onChange,
}) => {
	const [sliderValue, setSliderValue] = useState(value);
	const [inputValue, setInputValue] = useState(String(value));
	const [isEditing, setIsEditing] = useState(false);

	const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newValue = Number.parseInt(e.target.value, 10);
		setSliderValue(newValue);
		setInputValue(String(newValue));
		onChange(newValue);
	};

	const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newInputValue = e.target.value;
		setInputValue(newInputValue);

		const parsedValue = Number.parseInt(newInputValue, 10);
		if (!Number.isNaN(parsedValue)) {
			const clampedValue = Math.max(min, Math.min(max, parsedValue));
			setSliderValue(clampedValue);
			onChange(clampedValue);
		}
	};

	const handleNumberInputFocus = () => {
		setIsEditing(true);
	};

	const handleNumberInputBlur = () => {
		setIsEditing(false);
		const parsedValue = Number.parseInt(inputValue, 10);
		if (!Number.isNaN(parsedValue)) {
			const clampedValue = Math.max(min, Math.min(max, parsedValue));
			setSliderValue(clampedValue);
			setInputValue(String(clampedValue));
			onChange(clampedValue);
		} else {
			setInputValue(String(sliderValue));
		}
	};

	useEffect(() => {
		if (!isEditing) {
			setSliderValue(value);
			setInputValue(String(value));
		}
	}, [value, isEditing]);

	return (
		<MenuSliderWrapper>
			<MenuSliderInput
				type="range"
				min={min}
				max={max}
				value={sliderValue}
				onChange={handleSliderChange}
			/>
			<MenuSliderFooter>
				<MenuSliderLabel>Thickness</MenuSliderLabel>
				<MenuSliderNumberInput
					type="number"
					min={min}
					max={max}
					value={inputValue}
					onChange={handleNumberInputChange}
					onFocus={handleNumberInputFocus}
					onBlur={handleNumberInputBlur}
				/>
			</MenuSliderFooter>
		</MenuSliderWrapper>
	);
};

export const MenuSlider = memo(MenuSliderComponent);
