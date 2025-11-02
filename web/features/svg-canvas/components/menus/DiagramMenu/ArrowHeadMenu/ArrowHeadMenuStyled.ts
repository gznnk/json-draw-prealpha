import styled from "@emotion/styled";

import { BOX_SHADOW } from "../../../../constants/styling/core/CommonStyling";

type ArrowHeadMenuButtonProps = {
	isActive?: boolean;
};

export const ArrowHeadSelectorGrid = styled.div`
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	gap: 4px;
	padding: 8px;
	background-color: #fff;
	border-radius: 4px;
	box-shadow: ${BOX_SHADOW};
	pointer-events: auto;
`;

export const ArrowHeadSelectorButton = styled.button<ArrowHeadMenuButtonProps>`
	display: flex;
	align-items: center;
	justify-content: center;
	width: 32px;
	height: 32px;
	padding: 4px;
	border: 1px solid ${(props) => (props.isActive ? "#6b7280" : "#e5e7eb")};
	border-radius: 6px;
	background-color: ${(props) => (props.isActive ? "#f9fafb" : "transparent")};
	cursor: pointer;
	user-select: none;
	transition: all 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);

	&:hover {
		background-color: #f3f4f6;
		border-color: #9ca3af;
	}

	svg {
		color: #6b7280;
		transition: color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
	}

	&:hover svg {
		color: #374151;
	}

	${(props) =>
		props.isActive &&
		`
		svg {
			color: #374151;
		}
	`}
`;
