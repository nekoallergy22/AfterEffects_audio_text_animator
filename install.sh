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

# アーカイブディレクトリの作成
ARCHIVE_DIR="$AE_SCRIPTS_DIR/_archives"
if [ ! -d "$ARCHIVE_DIR" ]; then
  echo "アーカイブディレクトリを作成しています..."
  mkdir -p "$ARCHIVE_DIR"
  if [ $? -ne 0 ]; then
    echo "エラー: アーカイブディレクトリの作成に失敗しました。"
    echo "権限の問題がある場合は、sudo を使用して実行してください: sudo ./install.sh"
    exit 1
  fi
fi

# 現在の日時を取得（ファイル名用）
TIMESTAMP=$(date +"%Y%m%d_%H%M")

# components.jsx をコピー
echo "components.jsx を After Effects スクリプトフォルダにコピーしています..."
if [ -f "$AE_SCRIPTS_DIR/components.jsx" ]; then
  echo "既存の components.jsx ファイルをアーカイブしています..."
  mv "$AE_SCRIPTS_DIR/components.jsx" "$ARCHIVE_DIR/components_${TIMESTAMP}.jsx"
  if [ $? -ne 0 ]; then
    echo "エラー: 既存の components.jsx ファイルのアーカイブに失敗しました。"
    echo "権限の問題がある場合は、sudo を使用して実行してください: sudo ./install.sh"
    exit 1
  fi
fi

cp "$CURRENT_DIR/components.jsx" "$AE_SCRIPTS_DIR/"
if [ $? -ne 0 ]; then
  echo "エラー: components.jsx のコピーに失敗しました。"
  echo "権限の問題がある場合は、sudo を使用して実行してください: sudo ./install.sh"
  exit 1
fi

# myUI.jsx をコピー
echo "myUI.jsx を After Effects スクリプトフォルダにコピーしています..."
if [ -f "$AE_SCRIPTS_DIR/myUI.jsx" ]; then
  echo "既存の myUI.jsx ファイルをアーカイブしています..."
  mv "$AE_SCRIPTS_DIR/myUI.jsx" "$ARCHIVE_DIR/myUI_${TIMESTAMP}.jsx"
  if [ $? -ne 0 ]; then
    echo "エラー: 既存の myUI.jsx ファイルのアーカイブに失敗しました。"
    echo "権限の問題がある場合は、sudo を使用して実行してください: sudo ./install.sh"
    exit 1
  fi
fi

cp "$CURRENT_DIR/myUI.jsx" "$AE_SCRIPTS_DIR/"
if [ $? -ne 0 ]; then
  echo "エラー: myUI.jsx のコピーに失敗しました。"
  echo "権限の問題がある場合は、sudo を使用して実行してください: sudo ./install.sh"
  exit 1
fi

# 完了メッセージ
echo "インストールが完了しました！"
echo "After Effects 2025 を起動し、「ウィンドウ > myUI.jsx」からスクリプトパネルを開いてください。"
