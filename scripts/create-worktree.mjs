#!/usr/bin/env node

import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";

/**
 * 現在のブランチから新しいブランチを作成し、同名のworktreeを作成するスクリプト
 */

function main() {
	const args = process.argv.slice(2);

	if (args.length === 0) {
		console.log("Usage: npm run create-worktree <branch-name>");
		console.log("Example: npm run create-worktree feature-new-component");
		process.exit(1);
	}

	const branchName = args[0];

	// ブランチ名の検証
	if (!/^[a-zA-Z0-9\-_/.]+$/.test(branchName)) {
		console.error(
			"❌ Invalid branch name. Use only alphanumeric characters, hyphens, underscores, slashes, and dots.",
		);
		process.exit(1);
	}

	try {
		// 現在のブランチを取得
		const currentBranch = execSync("git branch --show-current", {
			encoding: "utf8",
		}).trim();
		console.log(`📍 Current branch: ${currentBranch}`);

		// ブランチが既に存在するかチェック
		try {
			execSync(`git show-ref --verify --quiet refs/heads/${branchName}`, {
				stdio: "ignore",
			});
			console.error(`❌ Branch '${branchName}' already exists.`);
			process.exit(1);
		} catch {
			// ブランチが存在しない場合は続行
		}

		// worktreeディレクトリが既に存在するかチェック
		const worktreePath = path.resolve("..", branchName);
		if (existsSync(worktreePath)) {
			console.error(`❌ Directory '${worktreePath}' already exists.`);
			process.exit(1);
		}

		// 新しいブランチとworktreeを同時に作成
		console.log(
			`🌿 Creating new branch '${branchName}' and worktree from '${currentBranch}'...`,
		);
		execSync(
			`git worktree add -b ${branchName} ../${branchName} ${currentBranch}`,
			{ stdio: "inherit" },
		);

		// 作成したworktreeに移動
		console.log(`📁 Moving to worktree ${branchName}...`);
		process.chdir(`../${branchName}`);

		console.log("✅ Successfully created branch and worktree!");
		console.log(`📂 Current location: ${process.cwd()}`);
		console.log(`🎯 Ready to work on branch '${branchName}'`);
	} catch (error) {
		console.error("❌ Error occurred:", error.message);
		process.exit(1);
	}
}

main();
