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
	background-color: #1f2937; // Dark gray background
	color: #f9fafb; // Light text
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
	color: #9ca3af; // Gray placeholder text
	font-style: italic;
`;
