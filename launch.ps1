# Rice Tracker Launcher for Windows (PowerShell)
$OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "-----------------------------------------------"
Write-Host "   Rice Tracker Premium Launcher for Windows"
Write-Host "-----------------------------------------------"

# Node.js check
if (!(Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "【エラー】Node.js がインストールされていないようです。" -ForegroundColor Red
    Write-Host "このツールを動かすには Node.js が必要です。"
    Write-Host ""
    Write-Host "1. ブラウザでダウンロードページを開きます..."
    Start-Process "https://nodejs.org/"
    Write-Host "2. 推奨版(LTS)をダウンロードしてインストールしてください。"
    Write-Host "3. インストール完了後、このファイルを再度開いてください。"
    Read-Host "Press enter to exit..."
    exit
}

Write-Host "Node.js が見つかりました: $(node -v)"

# Set Current Directory
Set-Location $PSScriptRoot

# Install dependencies
Write-Host "依存関係を確認・インストール中..."
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "【エラー】パッケージのインストールに失敗しました。" -ForegroundColor Red
    Read-Host "Press enter to exit..."
    exit
}

# Install Playwright Browsers
Write-Host "ブラウザ環境をセットアップ中 (初回のみ時間がかかります)..."
npx playwright install chromium firefox

# Start server
Write-Host "サーバーを起動しています..."
Start-Sleep -Seconds 3
Start-Process "http://127.0.0.1:3333"
node server.js

if ($LASTEXITCODE -ne 0) {
    Write-Host "【エラー】サーバーの起動中に問題が発生しました。" -ForegroundColor Red
    Read-Host "Press enter to exit..."
}
