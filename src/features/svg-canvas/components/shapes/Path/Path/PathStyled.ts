// Import Emotion for styling.
import styled from "@emotion/styled";

/**
 * Props for the SVG path element.
 */
type PathProps = {
	isTransparent?: boolean;
};

/**
 * Styled path element for diagrams.
 */
export const PathElement = styled.path<PathProps>`
    opacity: ${(props) => (props.isTransparent ? 0 : 1)};
`;
