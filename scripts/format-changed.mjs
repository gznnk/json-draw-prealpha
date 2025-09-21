#!/usr/bin/env node

import { execSync } from "node:child_process";
import path from "node:path";

function formatChanged(staged = false) {
	try {
		// Get list of changed files
		const gitCommand = staged
			? "git diff --cached --name-only --diff-filter=ACMR"
			: "git diff --name-only --diff-filter=ACMR HEAD";

		const changedFiles = execSync(gitCommand, { encoding: "utf8" })
			.split("\n")
			.filter(Boolean)
			.filter((file) => /\.(ts|tsx|js|jsx|mjs|json|md)$/.test(file))
			.map((file) => path.resolve(file));

		if (changedFiles.length === 0) {
			console.log("No files to format.");
			return;
		}
		console.log(`Formatting ${changedFiles.length} changed files...`);
		changedFiles.forEach((file) => console.log(`  ${file}`));

		// Format the files
		const prettierCommand = `npx prettier --write ${changedFiles.map((f) => `"${f}"`).join(" ")}`;
		execSync(prettierCommand, { stdio: "inherit" });

		console.log("✓ Files formatted successfully.");
	} catch (error) {
		if (error.status === 128) {
			console.log("No git repository found or no changes detected.");
		} else {
			console.error("Error formatting files:", error.message);
			process.exit(1);
		}
	}
}

// Check if this is for staged files
const isStaged = process.argv.includes("--staged");
formatChanged(isStaged);
