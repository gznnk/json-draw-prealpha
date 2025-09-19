import styled from "@emotion/styled";

export const DiagramMenuItemDiv = styled.div`
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: center;
	width: 32px;
	height: 32px;
	border-radius: 4px;
	border: 1px solid transparent;
	cursor: pointer;
	user-select: none;
	transition: all 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);

	&:hover {
		background-color: #f5f5f5;
	}

	&.active {
		background-color: #e6f4ff;
		border-color: #1890ff;
	}

	&.disabled {
		cursor: not-allowed;
		opacity: 0.25;

		&:hover {
			background-color: transparent;
		}
	}

	svg {
		color: rgba(0, 0, 0, 0.65);
		transition: color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
	}

	&:hover svg {
		color: #1890ff;
	}

	&.active svg {
		color: #1890ff;
	}

	&.disabled svg {
		color: rgba(0, 0, 0, 0.25);
	}
`;
