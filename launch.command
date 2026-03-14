#!/bin/bash

# Rice Tracker Launcher for macOS

echo "-----------------------------------------------"
echo "   Rice Tracker Premium Launcher for macOS"
echo "-----------------------------------------------"

# Node.js チェック
if ! command -v node &> /dev/null
then
    echo "【エラー】Node.js がインストールされていないようです。"
    echo "このツールを動かすには Node.js が必要です。"
    echo ""
    echo "1. ブラウザでダウンロードページを開きます..."
    open "https://nodejs.org/"
    echo "2. 推奨版(LTS)をダウンロードしてインストールしてください。"
    echo "3. インストール完了後、このファイルを再度開いてください。"
    echo ""
    read -p "Press enter to exit..."
    exit
fi

echo "Node.js が見つかりました: $(node -v)"

# ディレクトリ移動
cd "$(dirname "$0")"

# 依存関係のインストール (初回のみ/差分チェック)
echo "依存関係を確認中..."
npm install

# サーバー起動
echo "サーバーを起動しています..."
# ブラウザを開く
sleep 3 && open "http://127.0.0.1:3333" &
node server.js
