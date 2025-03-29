// ui/mainUI.jsx

// 必要なモジュールを読み込み
var scriptFolder = new File($.fileName).parent.absoluteURI;

$.evalFile(scriptFolder + "/constants.jsx");
$.evalFile(scriptFolder + "/logger.jsx");
$.evalFile(scriptFolder + "/utils.jsx");
$.evalFile(scriptFolder + "/fileHandlers.jsx");
$.evalFile(scriptFolder + "/compHandlers.jsx");
$.evalFile(scriptFolder + "/textHandlers.jsx");
$.evalFile(scriptFolder + "/animationHandlers.jsx");
$.evalFile(scriptFolder + "/jsonHandlers.jsx");
$.evalFile(scriptFolder + "/ui/standardTab.jsx");
$.evalFile(scriptFolder + "/ui/stepTab.jsx");
$.evalFile(scriptFolder + "/ui/debugTab.jsx");

// グローバル変数
var isProcessCancelled = false;

// ScriptUI Panels用のエントリーポイント
function buildUI(thisObj) {
  // ロガーを初期化
  Logger.init();
  Logger.info("UIの構築を開始");

  var panel =
    thisObj instanceof Panel
      ? thisObj
      : new Window("palette", "After Effects Audio Text Animator", undefined, {
          resizeable: true,
        });

  // パネルのサイズを設定
  panel.preferredSize = [UI_SETTINGS.PANEL_WIDTH, UI_SETTINGS.PANEL_HEIGHT];

  // タブパネルを作成
  var tpanel = panel.add("tabbedpanel", undefined, "モード");
  tpanel.alignChildren = "fill";

  // 各タブを追加
  var standardTab = buildStandardTab(tpanel);
  var stepTab = buildStepTab(tpanel);
  var debugTab = buildDebugTab(tpanel);

  // 初期タブを選択
  tpanel.selection = standardTab;

  // パネルのレイアウトを調整
  panel.layout.layout(true);
  panel.layout.resize();

  // パネルがドッキング可能なパネルの場合はリサイズ
  if (panel instanceof Window) {
    panel.center();
    panel.show();
  }

  Logger.info("UIの構築完了");
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
