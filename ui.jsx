// ui.jsx - ユーザーインターフェースを提供するモジュール
function createUI(thisObj) {
  var logger = new Logger("UI");

  try {
    // パネルの初期化
    var panel =
      thisObj instanceof Panel
        ? thisObj
        : new Window("palette", "JSON読み込み", [0, 0, 260, 360]);

    // JSONを読み込むボタン
    panel.loadButton = panel.add("button", [10, 10, 250, 40], "JSONを読み込む");

    // 結果表示エリア
    panel.resultText = panel.add("edittext", [10, 50, 250, 200], "", {
      multiline: true,
      readonly: true,
      scrollable: true,
    });

    // セクション数表示エリア
    panel.sectionCountText = panel.add("statictext", [10, 210, 250, 250], "", {
      multiline: true,
    });

    // コンポジション作成ボタン
    panel.createCompButton = panel.add(
      "button",
      [10, 260, 250, 290],
      "コンポジションを作成"
    );
    panel.createCompButton.enabled = false;

    // ステータス表示エリア
    panel.statusText = panel.add("statictext", [10, 300, 250, 320], "準備完了");

    // パネルのリサイズ対応
    panel.onResizing = panel.onResize = function () {
      this.layout.resize();
    };

    // ボタンクリックイベント
    panel.loadButton.onClick = function () {
      try {
        logger.log("JSONを読み込むボタンがクリックされました");
        panel.statusText.text = "JSONファイルを読み込んでいます...";
        loadJSON(panel);
        panel.statusText.text = "JSONファイルを読み込みました";
      } catch (e) {
        logger.log("JSONの読み込み中にエラーが発生しました: " + e.toString());
        panel.statusText.text = "エラーが発生しました";
        alert("エラーが発生しました: " + e.toString());
      }
    };

    // コンポジション作成ボタンのクリックイベント
    panel.createCompButton.onClick = function () {
      try {
        logger.log("コンポジション作成ボタンがクリックされました");
        panel.statusText.text = "コンポジションを作成しています...";
        createCompositions();
        panel.statusText.text = "コンポジションを作成しました";
      } catch (e) {
        logger.log(
          "コンポジション作成中にエラーが発生しました: " + e.toString()
        );
        panel.statusText.text = "エラーが発生しました";
        alert("エラーが発生しました: " + e.toString());
      }
    };

    // パネルのレイアウトを適用
    panel.layout.layout(true);

    logger.log("UIを作成しました");
    return panel;
  } catch (e) {
    alert("UIの作成中にエラーが発生しました: " + e.toString());
    logger.log("UIの作成中にエラーが発生しました: " + e.toString());
    return null;
  }
}
