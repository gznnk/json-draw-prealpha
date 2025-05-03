@echo off
setlocal EnableDelayedExpansion

REM ステージングされた変更があるか確認
git diff --cached --quiet
if %ERRORLEVEL% EQU 0 (
  echo No staged changes found, staging all changes...
  git add .
)

REM 自動生成メッセージを使用
echo Generating commit message based on changes...
for /f "tokens=*" %%a in ('node "%~dp0generate-commit-message.cjs"') do (
  set "AUTO_MSG=%%a"
)

REM 空のメッセージの場合はデフォルトを使用
if "!AUTO_MSG!"=="" (
  set "AUTO_MSG=Update files"
  echo Using default message: !AUTO_MSG!
) else (
  echo Using auto-generated message: !AUTO_MSG!
)

REM コミット実行
git commit -m "!AUTO_MSG!"

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