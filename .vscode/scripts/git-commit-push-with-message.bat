@echo off
setlocal EnableDelayedExpansion

REM 第1引数としてコミットメッセージを受け取る
set "COMMIT_MSG=%~1"

REM コミットメッセージが空の場合はエラー
if "!COMMIT_MSG!"=="" (
  echo Error: Commit message is required
  echo Usage: git-commit-push-with-message.bat "commit message"
  exit /b 1
)

REM ステージングされた変更があるか確認
git diff --cached --quiet
if %ERRORLEVEL% EQU 0 (
  echo No staged changes found, staging all changes...
  git add .
)

REM 変更があるか確認
git diff --cached --quiet
if %ERRORLEVEL% EQU 0 (
  echo No changes to commit
  exit /b 0
)

echo Using commit message: !COMMIT_MSG!

REM コミット実行
git commit -m "!COMMIT_MSG!"

REM コミットが成功した場合のみプッシュ
if %ERRORLEVEL% EQU 0 (
  echo Commit successful, pushing changes...
  git push
  if %ERRORLEVEL% EQU 0 (
    echo Push successful!
  ) else (
    echo Error: Push failed.
    exit /b 1
  )
) else (
  echo Error: Commit failed.
  exit /b 1
)

endlocal
