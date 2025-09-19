import styled from "@emotion/styled";

export const ZoomControlsContainer = styled.div`
	position: absolute;
	bottom: 24px;
	right: 24px;
	display: flex;
	align-items: center;
	background: #ffffff;
	border: 1px solid #d9d9d9;
	border-radius: 6px;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
	z-index: 1000;
	user-select: none;
	pointer-events: auto;
`;

export const ZoomButton = styled.button`
	display: flex;
	align-items: center;
	justify-content: center;
	width: 32px;
	height: 32px;
	border: none;
	background: transparent;
	color: rgba(0, 0, 0, 0.85);
	cursor: pointer;
	transition: all 0.2s ease;
	pointer-events: auto;

	&:hover {
		background: #f5f5f5;
		color: #1677ff;
	}

	&:active {
		background: #e6f4ff;
	}

	&:first-of-type {
		border-top-left-radius: 6px;
		border-bottom-left-radius: 6px;
	}

	&:last-of-type {
		border-top-right-radius: 6px;
		border-bottom-right-radius: 6px;
	}
`;

export const ZoomDisplay = styled.div`
	display: flex;
	align-items: center;
	justify-content: center;
	min-width: 48px;
	height: 32px;
	padding: 0 8px;
	font-size: 12px;
	font-weight: 500;
	color: rgba(0, 0, 0, 0.85);
	border-left: 1px solid #d9d9d9;
	border-right: 1px solid #d9d9d9;
	cursor: pointer;
	transition: all 0.2s ease;
	pointer-events: auto;

	&:hover {
		background: #f5f5f5;
		color: #1677ff;
	}

	&:active {
		background: #e6f4ff;
	}
`;
