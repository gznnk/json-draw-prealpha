import styled from "@emotion/styled";

import { BOX_SHADOW } from "../../../../constants/styling/core/CommonStyling";

export const CanvasMenuDiv = styled.div`
	position: absolute;
	top: 10px;
	left: 10px;
	display: flex;
	flex-direction: column;
	gap: 12px;
	background-color: #ffffff;
	border: 1px solid #d9d9d9;
	padding: 8px;
	box-shadow: ${BOX_SHADOW};
	border-radius: 6px;
	pointer-events: none;
	user-select: none;
	z-index: 1000;
	max-height: calc(100vh - 100px);
	overflow-y: auto;

	& * {
		user-select: none;
	}
`;

export const CanvasMenuCategoryDiv = styled.div`
	display: flex;
	flex-direction: column;
	gap: 4px;
`;

export const CanvasMenuCategoryLabel = styled.div`
	font-size: 11px;
	font-weight: 600;
	color: #666;
	text-transform: uppercase;
	padding: 4px 8px;
	cursor: pointer;
	user-select: none;
	pointer-events: auto;

	&:hover {
		color: #333;
	}

	&[data-collapsed="true"]::before {
		content: "▶ ";
	}

	&[data-collapsed="false"]::before {
		content: "▼ ";
	}
`;

export const CanvasMenuItemsDiv = styled.div`
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(32px, 1fr));
	gap: 4px;
	padding: 0 4px;
`;
