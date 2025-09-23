import styled from "@emotion/styled";

import { BOX_SHADOW } from "../../../../constants/styling/core/CommonStyling";

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
	box-shadow: ${BOX_SHADOW};
	border-radius: 6px;
	pointer-events: none;
	user-select: none;
	z-index: 1000;

	& * {
		user-select: none;
	}
`;
