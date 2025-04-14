// compCreator.jsx - コンポジション作成機能のメインモジュール

function createCompositions() {
  var logger = new Logger("CompCreator");

  if (!jsonData || !jsonData.slide) {
    alert("有効なJSONデータが読み込まれていません。");
    logger.log("有効なJSONデータが読み込まれていません");
    return;
  }

  app.beginUndoGroup("コンポジションの作成");

  try {
    // slideフォルダを作成
    var slideFolder = createSlideFolder();

    // スライドコンポジションを作成
    var result = createSlideCompositions(jsonData.slide, slideFolder);
    var slideItems = result.slideItems;
    var totalDuration = result.totalDuration;

    // メインコンポジションを作成
    if (jsonData.project && jsonData.project.name) {
      createMainComposition(jsonData.project.name, slideItems, totalDuration);
    }

    // 完了メッセージ
    alert(
      jsonData.slide.length +
        "個のコンポジションを作成し、slideフォルダ内に配置しました。\n" +
        "メインコンポジションの時間: " +
        (totalDuration + 10) +
        "秒 (合計時間 + 10秒バッファー)"
    );
    logger.log(
      jsonData.slide.length +
        "個のコンポジションを作成し、slideフォルダ内に配置しました"
    );
  } catch (e) {
    alert("コンポジション作成中にエラーが発生しました: " + e.toString());
    logger.log("コンポジション作成中にエラーが発生しました: " + e.toString());
  }

  app.endUndoGroup();
}
