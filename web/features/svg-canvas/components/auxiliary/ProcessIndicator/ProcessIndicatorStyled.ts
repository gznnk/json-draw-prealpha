import { keyframes, css } from "@emotion/react";
import styled from "@emotion/styled";

const blinkAnimation = keyframes`
	0% {
		opacity: 1;
	}
	50% {
		opacity: 0.5;
	}
	100% {
		opacity: 1;
	}
`;

export const StyledCircle = styled.circle<{
	statusColor: string;
	isProcessing: boolean;
}>`
	fill: ${(props) => props.statusColor};
	transition: fill 1s ease;
	${({ isProcessing }) =>
		isProcessing &&
		css`
			animation: ${blinkAnimation} 1s ease-in-out infinite;
		`}
`;
