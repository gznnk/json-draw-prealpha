import styled from "@emotion/styled";

export const ColorPickerContainer = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	box-sizing: border-box;
	padding: 6px 6px 4px 6px;
	border: 1px solid #e0e0e0;
	border-radius: 4px;
	background-color: #f9f9f9;
	box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
	user-select: none;
	pointer-events: auto;
`;

export const ColorGrid = styled.div`
	display: grid;
	grid-template-columns: repeat(4, 24px);
	grid-template-rows: repeat(3, 24px);
	gap: 6px;
	margin-bottom: 6px;
`;

type ColorSwatchProps = {
	selected: boolean;
	color: string;
};

export const ColorSwatch = styled.div<ColorSwatchProps>`
	width: 24px;
	height: 24px;
	box-sizing: border-box;
	position: relative;
	border-radius: 6px;
	border: ${({ selected }) => (selected ? "2px solid #333333" : "1px solid #e0e0e0")};
	background: ${({ color }) =>
		color === "transparent"
			? "repeating-conic-gradient(#ccc 0% 25%, #fff 0% 50%) 50% / 8px 8px"
			: color};
	cursor: pointer;
`;

type ColorInputProps = {
	isValid: boolean;
};

export const ColorInput = styled.input<ColorInputProps>`
	width: 80px;
	padding: 4px 6px;
	box-sizing: border-box;
	border: 1px solid ${({ isValid }) => (isValid ? "#e0e0e0" : "#f00")};
	border-radius: 4px;
	font-size: 14px;
	text-align: center;
	outline: none;
	::placeholder {
		opacity: 0.5;
	}
`;
