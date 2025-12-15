import { BaseMenuPlugin } from "./MenuPlugin";

/**
 * Web platform implementation of menu actions.
 * Uses browser APIs and web-specific functionality.
 */
export class WebMenuPlugin extends BaseMenuPlugin {
	getName(): string {
		return "WebMenuPlugin";
	}

	isAvailable(): boolean {
		// Check if we're running in a browser environment
		return typeof window !== "undefined" && typeof document !== "undefined";
	}

	async onNew(): Promise<void> {
		console.log("Web: Creating new file...");
		this.showNotification("新しいファイルを作成します", "info");

		// Check for unsaved changes
		const shouldProceed =
			!this.canvasDataContext?.hasUnsavedChanges ||
			confirm("現在の作業内容が失われます。新しいファイルを作成しますか？");

		if (shouldProceed) {
			// Canvas data context will handle the new canvas creation
			console.log("Web: New file created");
			this.showNotification("新しいファイルが作成されました", "success");
		}
	}

	async onOpen(): Promise<void> {
		console.log("Web: Opening file...");
		this.showNotification("ファイルを開きます", "info");

		// Web-specific implementation using File API
		try {
			const fileHandle = await this.showFilePickerDialog();
			if (fileHandle) {
				const file = await fileHandle.getFile();
				const content = await file.text();
				console.log(
					"Web: File opened:",
					file.name,
					"Content length:",
					content.length,
				);

				// Import canvas data if context is available
				if (this.canvasDataContext) {
					await this.canvasDataContext.importCanvasData(content);
				}

				this.showNotification(
					`ファイル "${file.name}" を開きました`,
					"success",
				);
			}
		} catch (error) {
			console.error("Web: Error opening file:", error);
			this.showNotification("ファイルを開けませんでした", "error");
		}
	}

	async onSave(): Promise<void> {
		console.log("Web: Saving file...");
		this.showNotification("ファイルを保存します", "info");

		// Web-specific implementation using File System Access API or download
		try {
			await this.saveFileDialog();
			console.log("Web: File saved");
			this.showNotification("ファイルが保存されました", "success");
		} catch (error) {
			console.error("Web: Error saving file:", error);
			this.showNotification("ファイルを保存できませんでした", "error");
		}
	}

	onHelp(): void {
		console.log("Web: Showing help...");

		// Show app name in alert instead of navigating
		alert("JSON Draw Pre-Alpha");
	}

	/**
	 * Show file picker dialog using File System Access API or fallback to input
	 */
	private async showFilePickerDialog(): Promise<FileSystemFileHandle | null> {
		// Modern browsers with File System Access API
		if ("showOpenFilePicker" in window) {
			try {
				const [fileHandle] = await (
					window as unknown as {
						showOpenFilePicker: (
							options: unknown,
						) => Promise<FileSystemFileHandle[]>;
					}
				).showOpenFilePicker({
					types: [
						{
							description: "JSON files",
							accept: {
								"application/json": [".json"],
							},
						},
					],
				});
				return fileHandle;
			} catch {
				// User cancelled
				return null;
			}
		}

		// Fallback for older browsers - return null as FileSystemFileHandle is not available
		return new Promise<FileSystemFileHandle | null>((resolve) => {
			const input = document.createElement("input");
			input.type = "file";
			input.accept = ".json";
			input.onchange = () => {
				// In fallback mode, we can't provide FileSystemFileHandle
				// This would need different handling in the calling code
				resolve(null);
			};
			input.click();
		});
	}

	/**
	 * Save file using File System Access API or download
	 */
	private async saveFileDialog(): Promise<void> {
		if (!this.canvasDataContext) {
			throw new Error("Canvas data context not available");
		}

		const content = this.canvasDataContext.exportCanvasData();
		const fileName = this.canvasDataContext.getCurrentFileName();

		// Modern browsers with File System Access API
		if ("showSaveFilePicker" in window) {
			const fileHandle = await (
				window as unknown as {
					showSaveFilePicker: (
						options: unknown,
					) => Promise<{
						createWritable: () => Promise<{
							write: (content: string) => Promise<void>;
							close: () => Promise<void>;
						}>;
					}>;
				}
			).showSaveFilePicker({
				suggestedName: fileName,
				types: [
					{
						description: "JSON files",
						accept: {
							"application/json": [".json"],
						},
					},
				],
			});
			const writable = await fileHandle.createWritable();
			await writable.write(content);
			await writable.close();
			return;
		}

		// Fallback for older browsers - trigger download
		const blob = new Blob([content], { type: "application/json" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = fileName;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}
}
