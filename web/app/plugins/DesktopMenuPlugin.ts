import { BaseMenuPlugin } from "./MenuPlugin";

interface ElectronAPI {
	showMessageBox?: (options: { type: string; buttons: string[]; defaultId: number; title: string; message: string }) => Promise<{ response: number }>;
	showOpenDialog?: (options: { properties: string[]; filters: { name: string; extensions: string[] }[] }) => Promise<{ canceled: boolean; filePaths: string[] }>;
	showSaveDialog?: (options: { defaultPath: string; filters: { name: string; extensions: string[] }[] }) => Promise<{ canceled: boolean; filePath: string }>;
	readFile?: (filePath: string) => Promise<string>;
	writeFile?: (filePath: string, content: string) => Promise<void>;
	openHelp?: () => void;
	showNotification?: (message: string, type: string) => void;
}

declare global {
	interface Window {
		electronAPI?: ElectronAPI;
	}
}

/**
 * Desktop platform implementation of menu actions.
 * Uses Electron or native desktop APIs for file operations.
 */
export class DesktopMenuPlugin extends BaseMenuPlugin {
	getName(): string {
		return "DesktopMenuPlugin";
	}

	isAvailable(): boolean {
		// Check if we're running in Electron or desktop environment
		return typeof window !== "undefined" && 
			   window.electronAPI !== undefined;
	}

	async onNew(): Promise<void> {
		console.log("Desktop: Creating new file...");
		this.showNotification("新しいファイルを作成します", "info");

		try {
			// Check for unsaved changes
			const shouldProceed = !this.canvasDataContext?.hasUnsavedChanges || 
				await this.showConfirmDialog(
					"新しいファイル",
					"現在の作業内容が失われます。新しいファイルを作成しますか？"
				);

			if (shouldProceed) {
				// Canvas data context will handle the new canvas creation
				console.log("Desktop: New file created");
				this.showNotification("新しいファイルが作成されました", "success");
			}
		} catch (error) {
			console.error("Desktop: Error creating new file:", error);
			this.showNotification("新しいファイルを作成できませんでした", "error");
		}
	}

	async onOpen(): Promise<void> {
		console.log("Desktop: Opening file...");
		this.showNotification("ファイルを開きます", "info");

		try {
			// Desktop-specific implementation using Electron dialog
			const filePath = await this.showOpenDialog();
			
			if (filePath) {
				const content = await this.readFile(filePath);
				console.log("Desktop: File opened:", filePath, "Content length:", content.length);
				
				// Import canvas data if context is available
				if (this.canvasDataContext) {
					await this.canvasDataContext.importCanvasData(content);
				}
				
				this.showNotification(`ファイル "${filePath}" を開きました`, "success");
			}
		} catch (error) {
			console.error("Desktop: Error opening file:", error);
			this.showNotification("ファイルを開けませんでした", "error");
		}
	}

	async onSave(): Promise<void> {
		console.log("Desktop: Saving file...");
		this.showNotification("ファイルを保存します", "info");

		try {
			if (!this.canvasDataContext) {
				throw new Error("Canvas data context not available");
			}

			// Desktop-specific implementation using Electron dialog
			const filePath = await this.showSaveDialog();
			
			if (filePath) {
				const content = this.canvasDataContext.exportCanvasData();
				await this.writeFile(filePath, content);
				console.log("Desktop: File saved:", filePath);
				this.showNotification(`ファイル "${filePath}" を保存しました`, "success");
			}
		} catch (error) {
			console.error("Desktop: Error saving file:", error);
			this.showNotification("ファイルを保存できませんでした", "error");
		}
	}

	onHelp(): void {
		console.log("Desktop: Showing help...");
		this.showNotification("ヘルプを表示します", "info");

		// Desktop-specific implementation
		// Open help window or show native dialog
		this.showHelpWindow();
	}

	/**
	 * Show confirmation dialog using Electron APIs
	 */
	private async showConfirmDialog(title: string, message: string): Promise<boolean> {
		const electronAPI = window.electronAPI;
		if (electronAPI?.showMessageBox) {
			const result = await electronAPI.showMessageBox({
				type: 'question',
				buttons: ['はい', 'いいえ'],
				defaultId: 0,
				title,
				message,
			});
			return result.response === 0;
		}

		// Fallback to browser confirm
		return confirm(`${title}\n${message}`);
	}

	/**
	 * Show open file dialog using Electron APIs
	 */
	private async showOpenDialog(): Promise<string | null> {
		const electronAPI = window.electronAPI;
		if (electronAPI?.showOpenDialog) {
			const result = await electronAPI.showOpenDialog({
				properties: ['openFile'],
				filters: [
					{ name: 'JSON Files', extensions: ['json'] },
					{ name: 'All Files', extensions: ['*'] }
				]
			});
			
			if (!result.canceled && result.filePaths.length > 0) {
				return result.filePaths[0];
			}
		}

		return null;
	}

	/**
	 * Show save file dialog using Electron APIs
	 */
	private async showSaveDialog(): Promise<string | null> {
		const electronAPI = window.electronAPI;
		if (electronAPI?.showSaveDialog) {
			const result = await electronAPI.showSaveDialog({
				defaultPath: 'diagram.json',
				filters: [
					{ name: 'JSON Files', extensions: ['json'] },
					{ name: 'All Files', extensions: ['*'] }
				]
			});
			
			if (!result.canceled && result.filePath) {
				return result.filePath;
			}
		}

		return null;
	}

	/**
	 * Read file using Electron APIs
	 */
	private async readFile(filePath: string): Promise<string> {
		const electronAPI = window.electronAPI;
		if (electronAPI?.readFile) {
			return await electronAPI.readFile(filePath);
		}

		throw new Error("File read API not available");
	}

	/**
	 * Write file using Electron APIs
	 */
	private async writeFile(filePath: string, content: string): Promise<void> {
		const electronAPI = window.electronAPI;
		if (electronAPI?.writeFile) {
			return await electronAPI.writeFile(filePath, content);
		}

		throw new Error("File write API not available");
	}

	/**
	 * Show help window using Electron APIs
	 */
	private showHelpWindow(): void {
		const electronAPI = window.electronAPI;
		if (electronAPI?.openHelp) {
			electronAPI.openHelp();
		} else {
			// Fallback to alert
			alert("ヘルプ:\n- ファイル > 新規作成: 新しい図を作成\n- ファイル > 開く: 既存の図を開く\n- ファイル > 保存: 現在の図を保存");
		}
	}

	/**
	 * Override notification to use native notifications if available
	 */
	protected showNotification(message: string, type: "info" | "success" | "warning" | "error" = "info"): void {
		const electronAPI = window.electronAPI;
		if (electronAPI?.showNotification) {
			electronAPI.showNotification(message, type);
		} else {
			super.showNotification(message, type);
		}
	}
}