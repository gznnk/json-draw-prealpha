import styled from "@emotion/styled";

/**
 * Props for the SVG circle element.
 */
type CircleProps = {
	isTransparent?: boolean;
	outline: string;
};

/**
 * Styled circle element for drag points.
 */
export const Circle = styled.circle<CircleProps>`
	opacity: ${(props) => (props.isTransparent ? 0 : 1)};
	:focus {
		outline: ${(props) => props.outline};
		outline-offset: 3px;
	}
`;
