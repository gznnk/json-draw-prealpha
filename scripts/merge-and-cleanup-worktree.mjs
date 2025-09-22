#!/usr/bin/env node

import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

/**
 * commit & push後、親ブランチへマージしてworktreeを削除するスクリプト
 */

function main() {
	const args = process.argv.slice(2);

	if (args.length === 0) {
		console.log(
			'Usage: npm run merge-cleanup "<commit-message>" [target-branch]',
		);
		console.log('Example: npm run merge-cleanup "feat: add new component"');
		console.log('Example: npm run merge-cleanup "fix: button styling" main');
		process.exit(1);
	}

	const commitMessage = args[0];
	const targetBranch = args[1]; // オプション

	if (!commitMessage.trim()) {
		console.error("❌ Commit message cannot be empty.");
		process.exit(1);
	}

	try {
		// 現在のブランチを取得
		const currentBranch = execSync("git branch --show-current", {
			encoding: "utf8",
		}).trim();
		console.log(`📍 Current branch: ${currentBranch}`);

		// 親ブランチを決定
		let parentBranch = targetBranch;

		if (!parentBranch) {
			// 自動で親ブランチを取得を試行
			try {
				// upstreamブランチを取得
				const upstream = execSync(
					`git rev-parse --abbrev-ref ${currentBranch}@{upstream}`,
					{ encoding: "utf8" },
				).trim();
				if (upstream && upstream !== `${currentBranch}@{upstream}`) {
					parentBranch = upstream.replace(/^origin\//, "");
				}
			} catch {
				// upstreamが設定されていない場合
			}

			// upstreamが取得できない場合は、よくある親ブランチを推測
			if (!parentBranch) {
				const commonBranches = ["main", "master", "develop", "dev"];
				for (const branch of commonBranches) {
					try {
						execSync(`git show-ref --verify --quiet refs/heads/${branch}`, {
							stdio: "ignore",
						});
						parentBranch = branch;
						break;
					} catch {
						// ブランチが存在しない
					}
				}
			}

			if (!parentBranch) {
				console.error("❌ Could not determine parent branch automatically.");
				console.log("Please specify the target branch as the second argument:");
				console.log(`npm run merge-cleanup "${commitMessage}" <target-branch>`);
				process.exit(1);
			}
		}

		console.log(`🎯 Target branch: ${parentBranch}`);

		// 親ブランチが存在するかチェック
		try {
			execSync(`git show-ref --verify --quiet refs/heads/${parentBranch}`, {
				stdio: "ignore",
			});
		} catch {
			console.error(`❌ Target branch '${parentBranch}' does not exist.`);
			process.exit(1);
		}

		// 現在のブランチが親ブランチと同じでないかチェック
		if (currentBranch === parentBranch) {
			console.error(`❌ Cannot merge branch into itself (${currentBranch}).`);
			process.exit(1);
		}

		// 変更があるかチェック
		try {
			const status = execSync("git status --porcelain", {
				encoding: "utf8",
			}).trim();
			if (status) {
				console.log("📝 Found changes to commit...");
			} else {
				console.log("ℹ️  No changes to commit.");
			}
		} catch (error) {
			console.error("❌ Error checking git status:", error.message);
			process.exit(1);
		}

		// 変更をコミット（変更がある場合のみ）
		try {
			const status = execSync("git status --porcelain", {
				encoding: "utf8",
			}).trim();
			if (status) {
				console.log("📦 Adding and committing changes...");
				execSync("git add .", { stdio: "inherit" });
				execSync(`git commit -m "${commitMessage}"`, { stdio: "inherit" });
			}
		} catch (error) {
			console.error("❌ Error during commit:", error.message);
			process.exit(1);
		}

		// push（リモートブランチが存在する場合のみ）
		try {
			console.log("🚀 Pushing to remote...");
			execSync(`git push origin ${currentBranch}`, { stdio: "inherit" });
		} catch (error) {
			console.log(
				"ℹ️  Could not push to remote (branch may not exist remotely yet)",
			);
		}

		// 親ブランチに切り替え
		console.log(`🔄 Switching to ${parentBranch}...`);
		execSync(`git checkout ${parentBranch}`, { stdio: "inherit" });

		// 親ブランチを最新にする
		console.log(`📥 Pulling latest changes from ${parentBranch}...`);
		try {
			execSync(`git pull origin ${parentBranch}`, { stdio: "inherit" });
		} catch (error) {
			console.log(
				"ℹ️  Could not pull from remote, continuing with local merge...",
			);
		}

		// マージ
		console.log(`🔀 Merging ${currentBranch} into ${parentBranch}...`);
		try {
			execSync(`git merge ${currentBranch}`, { stdio: "inherit" });
		} catch (error) {
			console.error("❌ Merge conflict occurred!");
			console.log("🔧 Please resolve conflicts manually:");
			console.log("1. Fix conflicts in the files");
			console.log("2. Run: git add .");
			console.log("3. Run: git commit");
			console.log(`4. Run: git push origin ${parentBranch}`);
			console.log(
				`5. Manually remove worktree: git worktree remove ../${currentBranch}`,
			);
			console.log("Or run this script again after resolving conflicts");
			process.exit(1);
		}

		// マージ後のpush
		try {
			console.log(`🚀 Pushing merged changes to ${parentBranch}...`);
			execSync(`git push origin ${parentBranch}`, { stdio: "inherit" });
		} catch (error) {
			console.log("ℹ️  Could not push merged changes to remote");
		}

		// worktreeパスを取得
		const worktreePath = path.resolve("..", currentBranch);
		const isWorktree = existsSync(worktreePath);

		// worktreeを削除（存在する場合）
		if (isWorktree) {
			console.log(
				`📁 Moving to parent directory and removing worktree ${worktreePath}...`,
			);
			// 親ディレクトリに移動してからworktreeを削除
			process.chdir("..");
			execSync(`git worktree remove ${currentBranch}`, { stdio: "inherit" });
		}

		console.log("✅ Successfully merged and cleaned up!");
		console.log(
			`🎉 Changes from '${currentBranch}' have been merged into '${parentBranch}'`,
		);
		console.log(`📍 Branch '${currentBranch}' is preserved for future use`);
	} catch (error) {
		console.error("❌ Error occurred:", error.message);
		process.exit(1);
	}
}

main();
