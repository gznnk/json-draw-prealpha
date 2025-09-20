import { useCallback, useEffect, useState } from "react";

import { useCanvasData } from "../context/CanvasDataContext";
import type { MenuPlugin } from "../plugins/MenuPlugin";
import { MenuPluginManager } from "../plugins/MenuPluginManager";

/**
 * Custom hook for using menu plugins in React components.
 * Provides easy access to menu actions and plugin information.
 */
export const useMenuPlugin = () => {
	const [pluginManager] = useState(() => MenuPluginManager.getInstance());
	const [currentPlugin, setCurrentPlugin] = useState<MenuPlugin | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const canvasData = useCanvasData();

	// Update current plugin when manager changes
	useEffect(() => {
		setCurrentPlugin(pluginManager.getCurrentPlugin());
		// Pass canvas data context to plugin manager
		pluginManager.setCanvasDataContext(canvasData);
	}, [pluginManager, canvasData]);

	// Menu action handlers
	const handleNew = useCallback(async () => {
		setIsLoading(true);
		try {
			await pluginManager.onNew();
		} catch (error) {
			console.error("Error in handleNew:", error);
		} finally {
			setIsLoading(false);
		}
	}, [pluginManager]);

	const handleOpen = useCallback(async () => {
		setIsLoading(true);
		try {
			await pluginManager.onOpen();
		} catch (error) {
			console.error("Error in handleOpen:", error);
		} finally {
			setIsLoading(false);
		}
	}, [pluginManager]);

	const handleSave = useCallback(async () => {
		setIsLoading(true);
		try {
			await pluginManager.onSave();
		} catch (error) {
			console.error("Error in handleSave:", error);
		} finally {
			setIsLoading(false);
		}
	}, [pluginManager]);

	const handleHelp = useCallback(() => {
		try {
			pluginManager.onHelp();
		} catch (error) {
			console.error("Error in handleHelp:", error);
		}
	}, [pluginManager]);

	// Get environment info
	const environmentInfo = useCallback(() => {
		return pluginManager.getEnvironmentInfo();
	}, [pluginManager]);

	return {
		// Action handlers
		onNew: handleNew,
		onOpen: handleOpen,
		onSave: handleSave,
		onHelp: handleHelp,

		// State
		isLoading,
		currentPlugin,
		hasActivePlugin: pluginManager.hasActivePlugin(),

		// Utilities
		environmentInfo,
		pluginManager,
	};
};
