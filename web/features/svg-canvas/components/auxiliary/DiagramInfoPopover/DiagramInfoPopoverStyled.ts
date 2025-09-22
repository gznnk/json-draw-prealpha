import styled from "@emotion/styled";

import { POPOVER_WIDTH } from "../../../constants/styling/auxiliary/DiagramInfoPopoverStyling";

export const PopoverContainer = styled.div`
	position: absolute;
	z-index: 50;
	pointer-events: auto;
	background: rgba(255, 255, 255, 0.95);
	backdrop-filter: blur(8px);
	border: 1px solid #e5e7eb;
	border-radius: 0.5rem;
	box-shadow:
		0 10px 15px -3px rgba(0, 0, 0, 0.1),
		0 4px 6px -2px rgba(0, 0, 0, 0.05);
	max-width: ${POPOVER_WIDTH}px;
	font-family: Noto Sans JP;
`;

export const PopoverContent = styled.div`
	padding: 16px;
	display: flex;
	flex-direction: column;
	gap: 16px;
`;

export const PopoverFieldContainer = styled.div`
	display: flex;
	flex-direction: column;
	gap: 6px;
`;

export const PopoverLabel = styled.label`
	font-size: 12px;
	font-weight: 500;
	color: #374151;
	line-height: 1.25;
	padding-left: 2px;
	user-select: none;
`;

const baseInputStyle = `
	color: #111827;
	background: rgba(255, 255, 255, 0.8);
	border: 1px solid #d1d5db;
	border-radius: 0.375rem;
	padding: 0.5rem 0.75rem;
	font-size: 12px;
	font-family: inherit;
	line-height: 1.25;
	transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;

	&:focus {
		outline: none;
		border-color: #6b7280;
		box-shadow: 0 0 0 2px rgba(107, 114, 128, 0.2);
	}

	&:hover {
		border-color: #9ca3af;
	}

	&::placeholder {
		color: #9ca3af;
	}
`;

export const PopoverInput = styled.input`
	${baseInputStyle}
`;

export const PopoverTextarea = styled.textarea`
	${baseInputStyle}
	resize: vertical;
	min-height: 4em;
`;
