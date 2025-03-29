// mainUI.jsx - シンプル版

// グローバル変数
var scriptFolder = new File($.fileName).parent.absoluteURI;

// ScriptUI Panels用のエントリーポイント
function buildUI(thisObj) {
  var panel =
    thisObj instanceof Panel
      ? thisObj
      : new Window(
          "palette",
          "After Effects Audio Text Animator - シンプル版",
          undefined,
          {
            resizeable: true,
          }
        );

  // パネルのサイズを設定
  panel.preferredSize = [350, 200];

  // 説明テキスト
  var infoText = panel.add(
    "statictext",
    undefined,
    "これはシンプル版のUIです。\n問題の切り分けに使用します。",
    { multiline: true }
  );
  infoText.alignment = ["fill", "top"];
  infoText.preferredSize.height = 40;

  // テストボタン
  var testButton = panel.add("button", undefined, "テストボタン");
  testButton.size = [330, 40];
  testButton.onClick = function () {
    alert("ボタンが正常に動作しています！");
  };

  // パネルのレイアウトを調整
  panel.layout.layout(true);
  panel.layout.resize();

  // パネルがドッキング可能なパネルの場合はリサイズ
  if (panel instanceof Window) {
    panel.center();
    panel.show();
  }

  return panel;
} // buildUI関数の終わり

// After Effectsのバージョンチェック
function checkAEVersion() {
  if (parseFloat(app.version) < 13.0) {
    alert("このスクリプトはAfter Effects CC 2015以降が必要です。");
    return false;
  }
  return true;
} // checkAEVersion関数の終わり

// メイン実行関数
function main() {
  if (checkAEVersion()) {
    buildUI(this);
  }
} // main関数の終わり

// スクリプト実行
main();
