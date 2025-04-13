// Import React.
import type React from "react";
import { memo, useState, useEffect } from "react";

// Import components related to SvgCanvas.
import { Minus } from "../../../icons/Minus";
import { Plus } from "../../../icons/Plus";

// Imports related to this component.
import { DiagramMenuControl } from "../DiagramMenuControl";
import { MAX_FONT_SIZE, MIN_FONT_SIZE } from "./FontSizeSelectorConstants";
import {
	FontSizeSelectorButton,
	FontSizeSelectorDiv,
	FontSizeSelectorInput,
} from "./FontSizeSelectorStyled";

/**
 * Props for the FontSizeSelector component.
 */
type FontSizeSelectorProps = {
	fontSize: number;
	onFontSizeChange: (newFontSize: number) => void;
};

/**
 * FontSizeSelector component.
 */
const FontSizeSelectorComponent: React.FC<FontSizeSelectorProps> = ({
	fontSize,
	onFontSizeChange,
}) => {
	const [inputValue, setInputValue] = useState(fontSize.toString());

	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setInputValue(event.target.value);
		const newFontSize = Number.parseInt(event.target.value, 10);
		if (
			!Number.isNaN(newFontSize) &&
			MIN_FONT_SIZE <= newFontSize &&
			newFontSize <= MAX_FONT_SIZE
		) {
			onFontSizeChange(newFontSize);
		}
	};

	const handleMinusClick = () => {
		if (fontSize > MIN_FONT_SIZE) {
			onFontSizeChange(fontSize - 1);
		}
	};

	const handlePlusClick = () => {
		if (fontSize < MAX_FONT_SIZE) {
			onFontSizeChange(fontSize + 1);
		}
	};

	useEffect(() => {
		setInputValue(fontSize.toString());
	}, [fontSize]);

	return (
		<DiagramMenuControl>
			<FontSizeSelectorDiv>
				<FontSizeSelectorButton onClick={handleMinusClick}>
					<svg viewBox="0 0 1024 1024" width="100%" height="100%">
						<title>フォントサイズを縮小</title>
						<Minus />
					</svg>
				</FontSizeSelectorButton>
				<FontSizeSelectorInput
					value={inputValue}
					maxLength={3}
					onChange={handleChange}
				/>
				<FontSizeSelectorButton onClick={handlePlusClick}>
					<svg viewBox="0 0 1024 1024" width="100%" height="100%">
						<title>フォントサイズを縮小</title>
						<Plus />
					</svg>
				</FontSizeSelectorButton>
			</FontSizeSelectorDiv>
		</DiagramMenuControl>
	);
};

export const FontSizeSelector = memo(FontSizeSelectorComponent);
