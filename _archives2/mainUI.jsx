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
  panel.orientation = "column";
  panel.alignChildren = ["fill", "top"];
  panel.spacing = 10;
  panel.margins = 16;

  // タブパネルを作成
  var tpanel = panel.add("tabbedpanel", undefined, "モード");
  tpanel.alignChildren = ["fill", "top"];

  // 標準モードタブ
  var standardTab = tpanel.add("tab", undefined, "標準モード");
  standardTab.alignChildren = ["fill", "top"];

  // 標準モードの説明
  var standardInfo = standardTab.add(
    "statictext",
    undefined,
    "標準モードでは、すべての処理を一度に実行します。\n処理中はESCキーで中断できます。",
    { multiline: true }
  );
  standardInfo.alignment = ["fill", "top"];

  // 統合された処理ボタン
  var buttonProcessAll = standardTab.add(
    "button",
    undefined,
    "すべての処理を実行"
  );
  buttonProcessAll.onClick = function () {
    // ここに処理を記述
  };

  // パネルのレイアウトを調整
  panel.layout.layout(true);

  return panel;
}
