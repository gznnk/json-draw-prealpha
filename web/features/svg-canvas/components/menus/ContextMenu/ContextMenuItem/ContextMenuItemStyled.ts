import styled from "@emotion/styled";

/**
 * Styled element for the context menu item.
 */
export const ContextMenuItemDiv = styled.div`
	font-size: 14px;
	line-height: 22px;
	color: rgba(0, 0, 0, 0.88);
	padding: 5px 12px;
	margin: 0 4px;
	border-radius: 4px;
	cursor: pointer;
	transition: all 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
	display: flex;
	align-items: center;

	&:hover {
		background-color: #f5f5f5;
	}

	&:active {
		background-color: #e6f4ff;
	}

	&.disabled {
		color: rgba(0, 0, 0, 0.25);
		cursor: not-allowed;
		pointer-events: none;

		&:hover {
			background-color: transparent;
			color: rgba(0, 0, 0, 0.25);
		}
	}
`;
