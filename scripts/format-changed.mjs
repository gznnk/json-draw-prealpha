#!/usr/bin/env node

import { execSync } from "node:child_process";
import path from "node:path";

function getFiles(mode) {
	switch (mode) {
		case "staged":
			return execSync("git diff --cached --name-only --diff-filter=ACMR", {
				encoding: "utf8",
			});
		case "changed":
			return execSync("git diff --name-only --diff-filter=ACMR HEAD", {
				encoding: "utf8",
			});
		case "untracked":
			return execSync("git ls-files --others --exclude-standard", {
				encoding: "utf8",
			});
		case "all":
			const staged = execSync(
				"git diff --cached --name-only --diff-filter=ACMR",
				{ encoding: "utf8" },
			);
			const changed = execSync("git diff --name-only --diff-filter=ACMR HEAD", {
				encoding: "utf8",
			});
			const untracked = execSync("git ls-files --others --exclude-standard", {
				encoding: "utf8",
			});
			return [staged, changed, untracked].join("\n");
		default:
			throw new Error(`Unknown mode: ${mode}`);
	}
}

function formatFiles(mode) {
	try {
		// Get list of files based on mode
		const filesOutput = getFiles(mode);
		const allFiles = filesOutput
			.split("\n")
			.filter(Boolean)
			.filter((file) => /\.(ts|tsx|js|jsx|mjs|json|md)$/.test(file));

		// Remove duplicates
		const uniqueFiles = [...new Set(allFiles)].map((file) =>
			path.resolve(file),
		);

		if (uniqueFiles.length === 0) {
			console.log(`No ${mode} files to format.`);
			return;
		}

		console.log(`Formatting ${uniqueFiles.length} ${mode} files...`);
		uniqueFiles.forEach((file) => console.log(`  ${file}`));

		// Format the files
		const prettierCommand = `npx prettier --write ${uniqueFiles.map((f) => `"${f}"`).join(" ")}`;
		execSync(prettierCommand, { stdio: "inherit" });

		console.log("✓ Files formatted successfully.");
	} catch (error) {
		if (error.status === 128) {
			console.log("No git repository found or no files detected.");
		} else {
			console.error("Error formatting files:", error.message);
			process.exit(1);
		}
	}
}

// Determine mode based on command line arguments
let mode = "changed"; // default
if (process.argv.includes("--staged")) {
	mode = "staged";
} else if (process.argv.includes("--untracked")) {
	mode = "untracked";
} else if (process.argv.includes("--all")) {
	mode = "all";
}

formatFiles(mode);
