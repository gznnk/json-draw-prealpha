import { memo, useState, useCallback, useEffect, useRef } from "react";
import type { ReactElement } from "react";
import { Tree } from "react-arborist";
import type { NodeRendererProps } from "react-arborist";

import * as Styled from "./FolderTreeStyled";
import { useFolderTrees } from "../../../../app/hooks/useFolderTrees";
import type { TreeNode } from "../../types";

/**
 * Node component for rendering each tree node
 */
const NodeComponent = ({ node, style }: NodeRendererProps<TreeNode>) => {
	const icon = node.data.kind === "directory" ? "📁" : "📄";

	return (
		<Styled.NodeContainer
			style={style}
			isSelected={node.isSelected}
			onClick={() => node.toggle()}
		>
			<Styled.NodeIcon>{icon}</Styled.NodeIcon>
			<Styled.NodeLabel>{node.data.name}</Styled.NodeLabel>
		</Styled.NodeContainer>
	);
};

const Node = memo(NodeComponent);

/**
 * FolderTree component displays a file system tree using react-arborist
 */
const FolderTreeComponent = (): ReactElement => {
	const { folderTrees, isLoading, openFolder, loadFolderTree, removeFolder } =
		useFolderTrees();
	const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
	const [treeData, setTreeData] = useState<TreeNode | null>(null);
	const [isLoadingTree, setIsLoadingTree] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const treeContainerRef = useRef<HTMLDivElement>(null);
	const [treeHeight, setTreeHeight] = useState(600);

	// Update tree height when container size changes
	useEffect(() => {
		const updateHeight = () => {
			if (treeContainerRef.current) {
				const height = treeContainerRef.current.clientHeight;
				setTreeHeight(height);
			}
		};

		updateHeight();
		window.addEventListener("resize", updateHeight);
		return () => window.removeEventListener("resize", updateHeight);
	}, [treeData]);

	// Load tree data when a folder is selected
	useEffect(() => {
		if (!selectedFolderId) {
			setTreeData(null);
			return;
		}

		const loadTree = async () => {
			setIsLoadingTree(true);
			setError(null);
			try {
				const tree = await loadFolderTree(selectedFolderId);
				setTreeData(tree);
			} catch (err) {
				setError((err as Error).message);
				setTreeData(null);
			} finally {
				setIsLoadingTree(false);
			}
		};

		loadTree();
	}, [selectedFolderId, loadFolderTree]);

	const handleOpenFolder = useCallback(async () => {
		try {
			const id = await openFolder();
			if (id) {
				setSelectedFolderId(id);
			}
		} catch (err) {
			setError((err as Error).message);
		}
	}, [openFolder]);

	const handleRemoveFolder = useCallback(
		(id: string) => {
			removeFolder(id);
			if (selectedFolderId === id) {
				setSelectedFolderId(null);
			}
		},
		[removeFolder, selectedFolderId],
	);

	const handleFolderSelect = useCallback((id: string) => {
		setSelectedFolderId(id);
	}, []);

	// Convert FolderNode to array for react-arborist
	const treeDataArray = treeData ? [treeData] : [];

	return (
		<Styled.Container>
			<Styled.ToolbarContainer>
				<Styled.ToolbarButton onClick={handleOpenFolder}>
					Open Folder
				</Styled.ToolbarButton>
			</Styled.ToolbarContainer>

			{folderTrees.length > 0 && (
				<Styled.FolderListContainer>
					{folderTrees.map((folder) => (
						<Styled.FolderItem
							key={folder.id}
							isActive={selectedFolderId === folder.id}
							onClick={() => handleFolderSelect(folder.id)}
						>
							<span>📁</span>
							<Styled.FolderName>{folder.name}</Styled.FolderName>
							<Styled.RemoveButton
								onClick={(e) => {
									e.stopPropagation();
									handleRemoveFolder(folder.id);
								}}
							>
								×
							</Styled.RemoveButton>
						</Styled.FolderItem>
					))}
				</Styled.FolderListContainer>
			)}

			{isLoading && (
				<Styled.LoadingState>Loading folders...</Styled.LoadingState>
			)}

			{!isLoading && !selectedFolderId && folderTrees.length === 0 && (
				<Styled.EmptyState>
					No folders open. Click &quot;Open Folder&quot; to get started.
				</Styled.EmptyState>
			)}

			{!isLoading && selectedFolderId && isLoadingTree && (
				<Styled.LoadingState>Loading folder tree...</Styled.LoadingState>
			)}

			{error && <Styled.ErrorState>{error}</Styled.ErrorState>}

			{!isLoading &&
				!isLoadingTree &&
				!error &&
				selectedFolderId &&
				treeData && (
					<Styled.TreeContainer ref={treeContainerRef}>
						<Tree
							data={treeDataArray}
							openByDefault={false}
							width="100%"
							height={treeHeight}
							indent={16}
							rowHeight={24}
						>
							{Node}
						</Tree>
					</Styled.TreeContainer>
				)}
		</Styled.Container>
	);
};

export const FolderTree = memo(FolderTreeComponent);
