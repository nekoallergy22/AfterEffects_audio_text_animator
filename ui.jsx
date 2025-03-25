/**
 * After Effects Audio Text Animator - Main UI
 * ユーザーインターフェースとメイン処理を提供します
 */

// 必要なモジュールを読み込み
var scriptFolder = new File($.fileName).parent.absoluteURI;
$.evalFile(scriptFolder + "/utils.jsx");
$.evalFile(scriptFolder + "/animations.jsx");
$.evalFile(scriptFolder + "/textHandlers.jsx");
$.evalFile(scriptFolder + "/jsonHandlers.jsx");

// ScriptUI Panels用のエントリーポイント
function buildUI(thisObj) {
  var panel =
    thisObj instanceof Panel
      ? thisObj
      : new Window("palette", "After Effects Audio Text Animator", undefined, {
          resizeable: true,
        });

  // パネルのサイズを設定
  panel.preferredSize = [300, 100];

  // スクリプト1のボタンを追加
  var buttonSetCompDuration = panel.add(
    "button",
    undefined,
    "コンポジション長設定"
  );
  buttonSetCompDuration.size = [280, 30];
  buttonSetCompDuration.alignment = ["center", "top"];
  buttonSetCompDuration.onClick = processJSONForCompDuration;

  // スクリプト2のボタンを追加
  var buttonImportAudio = panel.add(
    "button",
    undefined,
    "オーディオインポート"
  );
  buttonImportAudio.size = [280, 30];
  buttonImportAudio.alignment = ["center", "top"];
  buttonImportAudio.onClick = processJSONForAudioImport;

  // パネルのレイアウトを調整
  panel.layout.layout(true);
  panel.layout.resize();

  // パネルがドッキング可能なパネルの場合はリサイズ
  if (panel instanceof Window) {
    panel.center();
    panel.show();
  }

  return panel;
}

// After Effectsのバージョンチェック
if (parseFloat(app.version) < 8) {
  alert("このスクリプトはAfter Effects CS3以降が必要です。");
} else {
  // UIを構築
  var myPanel = buildUI(this);
}
