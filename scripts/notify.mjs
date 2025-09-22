#!/usr/bin/env node

/**
 * Cross-platform notification script for Claude Code task completion
 * Usage: node scripts/notify.mjs [options]
 */

import notifier from "node-notifier";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Default notification settings
const DEFAULT_CONFIG = {
	title: "Claude Code",
	message: "Task completed successfully!",
	sound: true,
	wait: false,
	timeout: 5000,
};

/**
 * Parse command line arguments
 */
function parseArgs() {
	const args = process.argv.slice(2);
	const config = { ...DEFAULT_CONFIG };

	for (let i = 0; i < args.length; i++) {
		const arg = args[i];
		switch (arg) {
			case "--title":
			case "-t":
				config.title = args[++i];
				break;
			case "--message":
			case "-m":
				config.message = args[++i];
				break;
			case "--sound":
			case "-s":
				config.sound = args[++i] === "true";
				break;
			case "--timeout":
				config.timeout = parseInt(args[++i], 10);
				break;
			case "--wait":
			case "-w":
				config.wait = true;
				break;
			case "--success":
				config.title = "Claude Code - Success ✅";
				config.message = "Task completed successfully!";
				break;
			case "--error":
				config.title = "Claude Code - Error ❌";
				config.message = "Task completed with errors!";
				break;
			case "--build":
				config.title = "Claude Code - Build Complete 🏗️";
				config.message = "Build process finished!";
				break;
			case "--test":
				config.title = "Claude Code - Tests Complete 🧪";
				config.message = "Test suite finished!";
				break;
			case "--deploy":
				config.title = "Claude Code - Deployment Complete 🚀";
				config.message = "Application deployed successfully!";
				break;
			case "--help":
			case "-h":
				showHelp();
				process.exit(0);
				break;
			default:
				if (!arg.startsWith("-")) {
					// Treat standalone argument as message
					config.message = arg;
				}
				break;
		}
	}

	return config;
}

/**
 * Show help message
 */
function showHelp() {
	console.log(`
Claude Code Notification Script

Usage: node scripts/notify.mjs [options]

Options:
  -t, --title <text>     Notification title (default: "Claude Code")
  -m, --message <text>   Notification message (default: "Task completed successfully!")
  -s, --sound <bool>     Play notification sound (default: true)
      --timeout <ms>     Notification timeout in milliseconds (default: 5000)
  -w, --wait            Wait for user interaction before continuing
  -h, --help            Show this help message

Presets:
  --success             Success notification preset
  --error               Error notification preset  
  --build               Build completion preset
  --test                Test completion preset
  --deploy              Deployment completion preset

Examples:
  node scripts/notify.mjs --success
  node scripts/notify.mjs --title "Custom Title" --message "Custom message"
  node scripts/notify.mjs --build --wait
  node scripts/notify.mjs "Quick message"
`);
}

/**
 * Get project info from package.json
 */
async function getProjectInfo() {
	try {
		const packagePath = join(__dirname, "..", "package.json");
		const packageContent = await readFile(packagePath, "utf-8");
		const packageJson = JSON.parse(packageContent);
		return {
			name: packageJson.name || "Unknown Project",
			version: packageJson.version || "0.0.0",
		};
	} catch (error) {
		return {
			name: "Unknown Project",
			version: "0.0.0",
		};
	}
}

/**
 * Send cross-platform notification
 */
async function sendNotification(config) {
	const projectInfo = await getProjectInfo();
	
	// Enhance message with project context if it's a generic message
	if (config.message === DEFAULT_CONFIG.message) {
		config.message = `${projectInfo.name} - Task completed successfully!`;
	}

	return new Promise((resolve, reject) => {
		const notificationConfig = {
			title: config.title,
			message: config.message,
			sound: config.sound,
			wait: config.wait,
			timeout: config.timeout,
			// Add icon if available (optional)
			...(process.platform === "win32" && {
				icon: join(__dirname, "..", "public", "vite.svg"), // fallback icon
			}),
		};

		notifier.notify(notificationConfig, (err, response) => {
			if (err) {
				reject(err);
			} else {
				resolve(response);
			}
		});
	});
}

/**
 * Main function
 */
async function main() {
	try {
		const config = parseArgs();
		
		console.log(`Sending notification: ${config.title} - ${config.message}`);
		
		await sendNotification(config);
		
		if (config.wait) {
			console.log("Notification sent. Waiting for user interaction...");
		} else {
			console.log("Notification sent successfully!");
		}
		
		process.exit(0);
	} catch (error) {
		console.error("Failed to send notification:", error.message);
		process.exit(1);
	}
}

// Run the script
main();