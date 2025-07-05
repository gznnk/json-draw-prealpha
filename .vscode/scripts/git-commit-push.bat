@echo off
setlocal EnableDelayedExpansion

REM ステージングされた変更があるか確認
git diff --cached --quiet
if %ERRORLEVEL% EQU 0 (
  echo No staged changes found, staging all changes...
  git add .
)

REM コミットメッセージを取得
set "COMMIT_MSG=%~1"

REM 引数でメッセージが提供されていない場合は自動生成
if "!COMMIT_MSG!"=="" (
  echo No commit message provided, generating commit message based on changes...
  for /f "tokens=*" %%a in ('node "%~dp0generate-commit-message.cjs"') do (
    set "COMMIT_MSG=%%a"
  )
  
  REM 空のメッセージの場合はデフォルトを使用
  if "!COMMIT_MSG!"=="" (
    set "COMMIT_MSG=Update files"
    echo Using default message: !COMMIT_MSG!
  ) else (
    echo Using auto-generated message: !COMMIT_MSG!
  )
) else (
  echo Using provided message: !COMMIT_MSG!
)

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
  )
) else (
  echo Error: Commit failed.
)

endlocal
pause