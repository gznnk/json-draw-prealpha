import styled from "@emotion/styled";

/**
 * Root element of the content view
 * Wraps the entire content area
 */
export const Container = styled.div`
	display: flex;
	flex-direction: column;
	height: 100%;
	width: 100%;
	background-color: #1a1f33; // Dark navy (Section Background)
	color: #c0c4d2; // Light gray with blue tint (Primary Text)
	overflow: auto;
	padding: 0;
	position: relative;
`;

/**
 * Message shown when no content is available
 */
export const EmptyContent = styled.div`
	display: flex;
	align-items: center;
	justify-content: center;
	height: 100%;
	color: #666b82; // Dark gray with blue tint (Placeholder Text)
	font-style: italic;
`;
