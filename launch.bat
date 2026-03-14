@echo off
setlocal
echo -----------------------------------------------
echo    Rice Tracker Premium Launcher for Windows
echo -----------------------------------------------

:: Node.js check
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo 【エラー】Node.js がインストールされていないようです。
    echo このツールを動かすには Node.js が必要です。
    echo.
    echo 1. ブラウザでダウンロードページを開きます...
    start https://nodejs.org/
    echo 2. 推奨版(LTS)をダウンロードしてインストールしてください。
    echo 3. インストール完了後、このファイルを再度開いてください。
    echo.
    pause
    exit /b
)

echo Node.js が見つかりました: && node -v

:: Move to script directory
cd /d %~dp0

:: Install dependencies
echo 依存関係を確認中...
call npm install

:: Start server
echo サーバーを起動しています...
:: Open browser after a short delay
start http://127.0.0.1:3333
node server.js

pause
