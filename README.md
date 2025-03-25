# After Effects Audio Text Animator

After Effects Audio Text Animator は、オーディオファイルを含むコンポジションを自動的に処理し、テキストアニメーションを追加するための Adobe After Effects スクリプトです。

## 機能

- JSON ファイルからコンポジションの設定を読み込み
- オーディオファイルを自動的にコンポジションに配置
- オーディオレイヤーを時間順に自動配置
- オーディオファイル名に基づいたテキストレイヤーの自動生成
- テキストやアイコン、ラインなどの要素に自動的にアニメーションを適用

## インストール方法

1. `components.jsx` と `myUI.jsx` ファイルを After Effects のスクリプトフォルダにコピーします:

   ```
   /Applications/Adobe After Effects 2025/Scripts/ScriptUI Panels/
   ```

2. After Effects を起動（または再起動）します。

3. `ウィンドウ > myUI.jsx` からスクリプトパネルを開きます。

## 使用方法

スクリプトパネルには 2 つのボタンがあります:

1. **Set Comp Duration**: JSON ファイルを選択して、コンポジションの長さを設定します。
2. **Import Audio to Comp**: JSON ファイルを選択して、オーディオファイルをコンポジションに配置し、テキストとアニメーションを自動的に追加します。

## JSON ファイル形式

スクリプトは以下の形式の JSON ファイルを使用します:

```json
{
  "project": {
    "name": "メインコンポジション名"
  },
  "comp": [
    {
      "comp_id": "コンポジションID",
      "name": "コンポジション名",
      "duration": 5000 // ミリ秒単位
    }
  ],
  "audio": [
    {
      "name": "オーディオファイル名",
      "comp_id": "配置先コンポジションID"
    }
  ]
}
```

## 機能詳細

- オーディオファイル名から自動的にテキストを生成（`.mp3`拡張子を削除し、最初の 5 文字をスキップ）
- テキストレイヤーに自動的にフェードインアニメーションを適用
- アイコン、ライン、その他の要素に自動的にアニメーションを適用
- 複数のコンポジションを時間順に配置

## 必要条件

- Adobe After Effects CS3 以降（After Effects 2025 で動作確認済み）
