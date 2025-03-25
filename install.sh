#!/bin/bash

# After Effects Audio Text Animator インストールスクリプト
# components.jsx と myUI.jsx ファイルを After Effects のスクリプトフォルダにコピーします

# 定数
AE_SCRIPTS_DIR="/Applications/Adobe After Effects 2025/Scripts/ScriptUI Panels"
CURRENT_DIR=$(pwd)

# スクリプトの開始メッセージ
echo "After Effects Audio Text Animator インストールを開始します..."

# After Effects がインストールされているか確認
if [ ! -d "$AE_SCRIPTS_DIR" ]; then
  echo "エラー: After Effects 2025 が見つかりません。"
  echo "パス '$AE_SCRIPTS_DIR' が存在しません。"
  echo "After Effects 2025 がインストールされていることを確認してください。"
  exit 1
fi

# ファイルが存在するか確認
if [ ! -f "$CURRENT_DIR/components.jsx" ]; then
  echo "エラー: components.jsx ファイルが見つかりません。"
  echo "このスクリプトは AfterEffects_audio_text_animator リポジトリのルートディレクトリで実行してください。"
  exit 1
fi

if [ ! -f "$CURRENT_DIR/myUI.jsx" ]; then
  echo "エラー: myUI.jsx ファイルが見つかりません。"
  echo "このスクリプトは AfterEffects_audio_text_animator リポジトリのルートディレクトリで実行してください。"
  exit 1
fi

# ファイルをコピー
echo "components.jsx を After Effects スクリプトフォルダにコピーしています..."
cp "$CURRENT_DIR/components.jsx" "$AE_SCRIPTS_DIR/"
if [ $? -ne 0 ]; then
  echo "エラー: components.jsx のコピーに失敗しました。"
  echo "権限の問題がある場合は、sudo を使用して実行してください: sudo ./install.sh"
  exit 1
fi

echo "myUI.jsx を After Effects スクリプトフォルダにコピーしています..."
cp "$CURRENT_DIR/myUI.jsx" "$AE_SCRIPTS_DIR/"
if [ $? -ne 0 ]; then
  echo "エラー: myUI.jsx のコピーに失敗しました。"
  echo "権限の問題がある場合は、sudo を使用して実行してください: sudo ./install.sh"
  exit 1
fi

# 完了メッセージ
echo "インストールが完了しました！"
echo "After Effects 2025 を起動し、「ウィンドウ > myUI.jsx」からスクリプトパネルを開いてください。"
