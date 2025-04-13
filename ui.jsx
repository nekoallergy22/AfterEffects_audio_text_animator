// ui.jsx
function createUI(thisObj) {
  var logger = new Logger("UI");

  // 参考コードと同様の初期化方法
  var panel =
    thisObj instanceof Panel
      ? thisObj
      : new Window("palette", "JSON読み込み", undefined);

  // JSONを読み込むボタン
  panel.loadButton = panel.add("button", [10, 10, 240, 30], "JSONを読み込む");

  // 結果表示エリア
  panel.resultText = panel.add("edittext", [10, 40, 240, 240], "", {
    multiline: true,
    readonly: true,
  });

  // セクション数表示エリア
  panel.sectionCountText = panel.add("statictext", [10, 250, 240, 290], "", {
    multiline: true,
  });

  // コンポジション作成ボタン
  panel.createCompButton = panel.add(
    "button",
    [10, 300, 240, 330],
    "コンポジションを作成"
  );
  panel.createCompButton.enabled = false;

  // ボタンクリックイベント
  panel.loadButton.onClick = function () {
    logger.log("JSONを読み込むボタンがクリックされました");
    loadJSON(panel);
  };

  // コンポジション作成ボタンのクリックイベント
  panel.createCompButton.onClick = function () {
    logger.log("コンポジション作成ボタンがクリックされました");
    createCompositions();
  };

  logger.log("UIを作成しました");
  return panel;
}
