import styled from "@emotion/styled";

import { BOX_SHADOW } from "../../../../constants/styling/core/CommonStyling";

export const BorderStyleMenuWrapper = styled.div`
	display: flex;
	flex-direction: column;
	gap: 8px;
	padding: 8px;
	background-color: #fff;
	border-radius: 4px;
	box-shadow: ${BOX_SHADOW};
	pointer-events: auto;
`;

export const BorderStyleSection = styled.div`
	display: flex;
	gap: 4px;
	justify-content: center;
`;

type BorderStyleButtonProps = {
	isActive: boolean;
};

export const BorderStyleButton = styled.div<BorderStyleButtonProps>`
	display: flex;
	align-items: center;
	justify-content: center;
	width: 32px;
	height: 32px;
	border: 1px solid ${(props) => (props.isActive ? "#6b7280" : "transparent")};
	border-radius: 6px;
	background-color: ${(props) => (props.isActive ? "#f9fafb" : "transparent")};
	cursor: pointer;
	user-select: none;
	transition: all 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);

	&:hover {
		background-color: #f3f4f6;
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
