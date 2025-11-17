import styled from "@emotion/styled";

export const Container = styled.div`
	width: 100%;
	height: 100%;
	display: flex;
	flex-direction: column;
	overflow: hidden;
	background-color: #1e1e1e;
	color: #cccccc;
	font-family: "Consolas", "Monaco", "Courier New", monospace;
	font-size: 13px;
`;

export const TreeContainer = styled.div`
	flex: 1;
	width: 100%;
	overflow: hidden;
`;

export const NodeContainer = styled.div<{ isSelected: boolean }>`
	display: flex;
	align-items: center;
	padding: 2px 4px;
	cursor: pointer;
	background-color: ${(props) =>
		props.isSelected ? "#094771" : "transparent"};

	&:hover {
		background-color: ${(props) => (props.isSelected ? "#094771" : "#2a2d2e")};
	}
`;

export const NodeIcon = styled.span`
	margin-right: 4px;
	display: inline-block;
	width: 16px;
	text-align: center;
`;

export const NodeLabel = styled.span`
	flex: 1;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
`;

export const EmptyState = styled.div`
	display: flex;
	align-items: center;
	justify-content: center;
	height: 100%;
	color: #858585;
	font-size: 14px;
`;

export const LoadingState = styled.div`
	display: flex;
	align-items: center;
	justify-content: center;
	height: 100%;
	color: #858585;
	font-size: 14px;
`;

export const ErrorState = styled.div`
	display: flex;
	align-items: center;
	justify-content: center;
	height: 100%;
	color: #f48771;
	font-size: 14px;
	padding: 16px;
	text-align: center;
`;

export const ToolbarContainer = styled.div`
	display: flex;
	align-items: center;
	padding: 8px;
	border-bottom: 1px solid #3c3c3c;
	gap: 8px;
`;

export const ToolbarButton = styled.button`
	background-color: #0e639c;
	color: #ffffff;
	border: none;
	padding: 6px 12px;
	cursor: pointer;
	font-size: 12px;
	border-radius: 2px;

	&:hover {
		background-color: #1177bb;
	}

	&:active {
		background-color: #0d5a8f;
	}

	&:disabled {
		background-color: #3c3c3c;
		color: #858585;
		cursor: not-allowed;
	}
`;

export const FolderListContainer = styled.div`
	padding: 8px;
	border-bottom: 1px solid #3c3c3c;
`;

export const FolderItem = styled.div<{ isActive: boolean }>`
	display: flex;
	align-items: center;
	padding: 4px 8px;
	cursor: pointer;
	background-color: ${(props) => (props.isActive ? "#094771" : "transparent")};
	border-radius: 2px;
	margin-bottom: 2px;

	&:hover {
		background-color: ${(props) => (props.isActive ? "#094771" : "#2a2d2e")};
	}
`;

export const FolderName = styled.span`
	flex: 1;
	margin-left: 4px;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
`;

export const RemoveButton = styled.button`
	background-color: transparent;
	color: #858585;
	border: none;
	padding: 2px 6px;
	cursor: pointer;
	font-size: 12px;
	margin-left: 8px;

	&:hover {
		color: #f48771;
	}
`;
