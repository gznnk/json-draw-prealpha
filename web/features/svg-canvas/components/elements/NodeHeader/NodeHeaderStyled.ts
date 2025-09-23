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
