#!/bin/bash

# After Effects Audio Text Animator インストールスクリプト
# 必要なファイルを After Effects のスクリプトフォルダにコピーします

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

# インストールするファイルのリスト
FILES_TO_INSTALL=(
  "utils.jsx"
  "animations.jsx"
  "textHandlers.jsx"
  "jsonHandlers.jsx"
  "ui.jsx"
)

# ファイルが存在するか確認
for file in "${FILES_TO_INSTALL[@]}"; do
  if [ ! -f "$CURRENT_DIR/$file" ]; then
    echo "エラー: $file ファイルが見つかりません。"
    echo "このスクリプトは AfterEffects_audio_text_animator リポジトリのルートディレクトリで実行してください。"
    exit 1
  fi
done

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

# 各ファイルをコピー
for file in "${FILES_TO_INSTALL[@]}"; do
  echo "$file を After Effects スクリプトフォルダにコピーしています..."
  
  # 既存のファイルをアーカイブ
  if [ -f "$AE_SCRIPTS_DIR/$file" ]; then
    echo "既存の $file ファイルをアーカイブしています..."
    # ファイル名から拡張子を取り出す
    filename=$(basename -- "$file")
    extension="${filename##*.}"
    filename="${filename%.*}"
    
    mv "$AE_SCRIPTS_DIR/$file" "$ARCHIVE_DIR/${filename}_${TIMESTAMP}.${extension}"
    if [ $? -ne 0 ]; then
      echo "エラー: 既存の $file ファイルのアーカイブに失敗しました。"
      echo "権限の問題がある場合は、sudo を使用して実行してください: sudo ./install.sh"
      exit 1
    fi
  fi
  
  # 新しいファイルをコピー
  cp "$CURRENT_DIR/$file" "$AE_SCRIPTS_DIR/"
  if [ $? -ne 0 ]; then
    echo "エラー: $file のコピーに失敗しました。"
    echo "権限の問題がある場合は、sudo を使用して実行してください: sudo ./install.sh"
    exit 1
  fi
done

# 旧ファイルの処理（components.jsx と myUI.jsx）
# components.jsx は不要になったので、存在する場合はアーカイブする
if [ -f "$AE_SCRIPTS_DIR/components.jsx" ]; then
  echo "既存の components.jsx ファイルをアーカイブしています..."
  mv "$AE_SCRIPTS_DIR/components.jsx" "$ARCHIVE_DIR/components_${TIMESTAMP}.jsx"
  if [ $? -ne 0 ]; then
    echo "エラー: 既存の components.jsx ファイルのアーカイブに失敗しました。"
    echo "権限の問題がある場合は、sudo を使用して実行してください: sudo ./install.sh"
    exit 1
  fi
fi

# myUI.jsx は ui.jsx に置き換えられたので、存在する場合はアーカイブする
if [ -f "$AE_SCRIPTS_DIR/myUI.jsx" ]; then
  echo "既存の myUI.jsx ファイルをアーカイブしています..."
  mv "$AE_SCRIPTS_DIR/myUI.jsx" "$ARCHIVE_DIR/myUI_${TIMESTAMP}.jsx"
  if [ $? -ne 0 ]; then
    echo "エラー: 既存の myUI.jsx ファイルのアーカイブに失敗しました。"
    echo "権限の問題がある場合は、sudo を使用して実行してください: sudo ./install.sh"
    exit 1
  fi
fi

# 完了メッセージ
echo "インストールが完了しました！"
echo "After Effects 2025 を起動し、「ウィンドウ > ui.jsx」からスクリプトパネルを開いてください。"
