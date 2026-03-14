@echo off
setlocal
:: Set code page to UTF-8 to handle Japanese characters correctly in CMD
chcp 65001 >nul

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
echo 依存関係を確認・インストール中...
call npm install
if %errorlevel% neq 0 (
    echo 【エラー】パッケージのインストールに失敗しました。
    echo インターネット接続を確認してください。
    pause
    exit /b
)

:: Install Playwright Browsers
echo ブラウザ環境をセットアップ中 (初回のみ時間がかかります)...
call npx playwright install chromium firefox
if %errorlevel% neq 0 (
    echo 【警告】ブラウザのインストールに失敗した可能性があります。
    echo 実行時にエラーが出る場合は \`npx playwright install\` を手動で試してください。
)

:: Start server
echo サーバーを起動しています...
:: Open browser after a short delay
start http://127.0.0.1:3333
node server.js

if %errorlevel% neq 0 (
    echo.
    echo 【エラー】サーバーの起動中に問題が発生しました。
    pause
)

pause
