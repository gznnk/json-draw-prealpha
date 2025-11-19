import styled from "@emotion/styled";
import { memo, useCallback, useState } from "react";
import type { ReactElement } from "react";

import { FolderTree } from "../../../features/folder-explorer";
import type { SvgCanvasData } from "../../../features/svg-canvas/canvas/types/SvgCanvasData";
import type { FolderNode } from "../../models/FolderTree";
import { CanvasView } from "../CanvasView/CanvasView";
import { Page } from "../Page";

const Container = styled.div`
	display: flex;
	width: 100%;
	height: 100%;
`;

const SidePanel = styled.div`
	width: 300px;
	height: 100%;
	border-right: 1px solid #e5e7eb;
	overflow: hidden;
`;

const CanvasPanel = styled.div`
	flex: 1;
	height: 100%;
	overflow: hidden;
`;

const EmptyState = styled.div`
	display: flex;
	align-items: center;
	justify-content: center;
	height: 100%;
	color: #6b7280;
	font-size: 14px;
`;

/**
 * FolderExplorerView component displays the folder explorer with canvas integration
 */
const FolderExplorerViewComponent = (): ReactElement => {
	const [canvasData, setCanvasData] = useState<SvgCanvasData | null>(null);
	const [error, setError] = useState<string | null>(null);

	const handleFileSelect = useCallback(async (node: FolderNode) => {
		// Only handle .json files
		if (!node.name.endsWith(".json")) {
			return;
		}

		try {
			// Read file using FileSystemFileHandle
			if (!node.handle || node.handle.kind !== "file") {
				setError("Invalid file handle");
				return;
			}

			const fileHandle = node.handle as FileSystemFileHandle;
			const file = await fileHandle.getFile();
			const text = await file.text();
			const data = JSON.parse(text) as SvgCanvasData;

			// Validate that it's a valid canvas data structure
			if (!data.id || !Array.isArray(data.items)) {
				setError("Invalid canvas data format");
				return;
			}

			setCanvasData(data);
			setError(null);
		} catch (err) {
			setError((err as Error).message);
			setCanvasData(null);
		}
	}, []);

	return (
		<Page>
			<Container>
				<SidePanel>
					<FolderTree onFileSelect={handleFileSelect} />
				</SidePanel>
				<CanvasPanel>
					{error && <EmptyState>Error: {error}</EmptyState>}
					{!error && !canvasData && (
						<EmptyState>Select a JSON file to view on canvas</EmptyState>
					)}
					{!error && canvasData && <CanvasView content={canvasData} />}
				</CanvasPanel>
			</Container>
		</Page>
	);
};

export const FolderExplorerView = memo(FolderExplorerViewComponent);
