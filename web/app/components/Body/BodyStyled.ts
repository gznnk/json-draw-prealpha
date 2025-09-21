import styled from "@emotion/styled";

/**
 * Container component for the body content.
 * Defines the styling and layout for the main content area below the header.
 */
export const BodyContainer = styled.div<{ top?: number }>`
	position: fixed;
	top: ${(props) => `${props.top || 0}px`};
	left: 0;
	right: 0;
	bottom: 0;
	box-sizing: border-box;
	background-color: #111827;
`;
