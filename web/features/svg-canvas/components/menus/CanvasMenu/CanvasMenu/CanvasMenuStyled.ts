import styled from "@emotion/styled";

export const CanvasMenuDiv = styled.div`
	position: absolute;
	top: 10px;
	left: 10px;
	display: flex;
	flex-direction: column;
	gap: 4px;
	background-color: #ffffff;
	border: 1px solid #d9d9d9;
	padding: 8px;
	box-shadow:
		0 2px 8px rgba(0, 0, 0, 0.06),
		0 1px 2px rgba(0, 0, 0, 0.04);
	border-radius: 6px;
	pointer-events: none;
	user-select: none;
	z-index: 1000;

	& * {
		user-select: none;
	}
`;
