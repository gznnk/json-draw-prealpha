// Import Emotion for styling.
import styled from "@emotion/styled";

/**
 * Main container group for NodeHeader with move cursor and pointer-events disabled for children.
 */
export const MainContainerGroup = styled.g`
	cursor: move;
	pointer-events: none;
	
	* {
		pointer-events: none;
	}
`;

/**
 * Icon wrapper div with flexbox centering.
 */
export const IconWrapper = styled.div`
	width: 100%;
	height: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
	pointer-events: none;
`;