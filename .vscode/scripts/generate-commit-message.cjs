const { execSync } = require("node:child_process");
const path = require("node:path");

/**
 * Get list of changed files from git
 * @returns {string[]} Array of changed files
 */
function getChangedFiles() {
	try {
		// Get staged files
		const stagedFiles = execSync("git diff --name-only --staged")
			.toString()
			.trim()
			.split("\n")
			.filter(Boolean);

		// Get unstaged files
		const unstagedFiles = execSync("git diff --name-only")
			.toString()
			.trim()
			.split("\n")
			.filter(Boolean);

		// Combine both lists and remove duplicates
		return [...new Set([...stagedFiles, ...unstagedFiles])];
	} catch (error) {
		console.error("Error getting changed files:", error.message);
		return [];
	}
}

/**
 * Categorize files by type
 * @param {string[]} files - List of file paths
 * @returns {Object} Categorized files
 */
function categorizeFiles(files) {
	const categories = {
		feature: [],
		fix: [],
		docs: [],
		test: [],
		style: [],
		refactor: [],
		config: [],
		other: [],
	};

	for (const file of files) {
		const ext = path.extname(file).toLowerCase();

		// Config files
		if (
			file.includes("config") ||
			file.endsWith(".json") ||
			file.includes(".github") ||
			file.includes(".vscode")
		) {
			categories.config.push(file);
		}
		// Documentation
		else if (file.endsWith(".md") || file.includes("docs/")) {
			categories.docs.push(file);
		}
		// Tests
		else if (
			file.includes("test") ||
			file.includes("spec") ||
			file.includes("__tests__")
		) {
			categories.test.push(file);
		}
		// Style files
		else if ([".css", ".scss", ".less", ".styl"].includes(ext)) {
			categories.style.push(file);
		}
		// Feature or fix (based on simple heuristics)
		else if ([".js", ".ts", ".jsx", ".tsx"].includes(ext)) {
			if (file.includes("feature")) {
				categories.feature.push(file);
			} else {
				// See if it's likely a bugfix by looking at diff content
				try {
					const diff = execSync(`git diff ${file}`).toString().toLowerCase();
					if (
						diff.includes("fix") ||
						diff.includes("bug") ||
						diff.includes("issue")
					) {
						categories.fix.push(file);
					} else {
						categories.feature.push(file);
					}
				} catch (e) {
					categories.feature.push(file); // Default to feature
				}
			}
		}
		// Other files
		else {
			categories.other.push(file);
		}
	}

	return categories;
}

/**
 * Generate commit message based on changed files
 * @returns {string} Generated commit message
 */
function generateCommitMessage() {
	const changedFiles = getChangedFiles();

	if (!changedFiles.length) {
		return "No changes detected";
	}

	const categories = categorizeFiles(changedFiles);

	// Determine primary category
	let primaryType = "update";
	let files = [];

	if (categories.fix.length > 0) {
		primaryType = "fix";
		files = categories.fix;
	} else if (categories.feature.length > 0) {
		primaryType = "feat";
		files = categories.feature;
	} else if (categories.docs.length > 0) {
		primaryType = "docs";
		files = categories.docs;
	} else if (categories.style.length > 0) {
		primaryType = "style";
		files = categories.style;
	} else if (categories.config.length > 0) {
		primaryType = "config";
		files = categories.config;
	} else if (categories.test.length > 0) {
		primaryType = "test";
		files = categories.test;
	}

	// Get the primary file or directory for the message
	let scope = "";
	if (files.length > 0) {
		const file = files[0];
		const parts = file.split("/");
		if (parts.length > 1) {
			scope = parts[0]; // Use first directory as scope
		} else {
			scope = path.basename(file, path.extname(file)); // Use filename without extension
		}
	}

	// Create message
	let message = "";

	if (scope) {
		message = `${primaryType}(${scope})`;
	} else {
		message = primaryType;
	}

	// Add summary based on files
	if (files.length === 1) {
		const fileName = path.basename(files[0]);
		message += `: Update ${fileName}`;
	} else if (files.length <= 3) {
		const fileNames = files.map((f) => path.basename(f)).join(", ");
		message += `: Update ${fileNames}`;
	} else {
		const count = changedFiles.length;
		message += `: Update ${count} files`;
	}

	return message;
}

// Output the generated message
console.log(generateCommitMessage());
