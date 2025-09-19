import styled from "@emotion/styled";

export const ColorPickerContainer = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	box-sizing: border-box;
	padding: 12px;
	border: 1px solid #d9d9d9;
	border-radius: 6px;
	background-color: #ffffff;
	box-shadow:
		0 2px 8px rgba(0, 0, 0, 0.06),
		0 1px 2px rgba(0, 0, 0, 0.04);
	user-select: none;
	pointer-events: auto;
	z-index: 1100;
`;

export const ColorGrid = styled.div`
	display: grid;
	grid-template-columns: repeat(4, 28px);
	grid-template-rows: repeat(4, 28px);
	gap: 8px;
	margin-bottom: 12px;
`;

type ColorSwatchProps = {
	selected: boolean;
	color: string;
};

export const ColorSwatch = styled.div<ColorSwatchProps>`
	width: 28px;
	height: 28px;
	box-sizing: border-box;
	position: relative;
	border-radius: 6px;
	border: ${({ selected }) =>
		selected ? "2px solid #1890ff" : "1px solid #d9d9d9"};
	background: ${({ color }) =>
		color === "transparent"
			? "repeating-conic-gradient(#ccc 0% 25%, #fff 0% 50%) 50% / 8px 8px"
			: color};
	cursor: pointer;
	transition: all 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);

	&:hover {
		border-color: #1890ff;
		transform: scale(1.1);
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
	}

	&:active {
		transform: scale(1.05);
	}
`;

type ColorInputProps = {
	isValid: boolean;
};

export const ColorInput = styled.input<ColorInputProps>`
	width: 120px;
	height: 32px;
	padding: 4px 11px;
	box-sizing: border-box;
	border: 1px solid ${({ isValid }) => (isValid ? "#d9d9d9" : "#ff4d4f")};
	border-radius: 6px;
	background-color: #ffffff;
	color: rgba(0, 0, 0, 0.88);
	font-size: 14px;
	text-align: center;
	outline: none;
	transition: all 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);

	&:focus {
		border-color: #1890ff;
		box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
	}

	&:hover {
		border-color: ${({ isValid }) => (isValid ? "#40a9ff" : "#ff7875")};
	}

	::placeholder {
		color: rgba(0, 0, 0, 0.25);
		opacity: 1;
	}
`;
