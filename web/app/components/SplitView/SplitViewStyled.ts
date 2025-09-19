import styled from "@emotion/styled";

// Emotion styled components
export const Container = styled.div`
	display: flex;
	width: 100%;
	height: 100%;
	overflow: hidden;
`;

export const Pane = styled.div`
	position: relative;
	overflow: auto;
	height: 100%;
`;

export const Divider = styled.div`
	width: 1px;
	height: 100%;
	background-color: #3a415c;
	position: relative;

	&:hover {
		background-color: #2a3366;
	}
`;

export const DividerHitArea = styled.div`
	position: absolute;
	top: 0;
	left: -2px;
	right: -2px;
	height: 100%;
	cursor: col-resize;
	z-index: 1;
`;
