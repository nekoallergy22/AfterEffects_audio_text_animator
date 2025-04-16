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

    // 各サブコンポジションに対応する音声データを配置
    addAudioToSubComps(slideItems, jsonData.slide);

    // メインコンポジションを作成（スライド間のみ配置）
    if (jsonData.project && jsonData.project.name) {
      createMainComposition(jsonData.project.name, slideItems, totalDuration);
    }

    alert(
      jsonData.slide.length +
        "個のコンポジションと関連付けられた音声データが作成されました。"
    );

    logger.log(
      jsonData.slide.length +
        "個のコンポジションと関連付けられた音声データが作成されました。"
    );
  } catch (e) {
    alert("コンポジション作成中にエラーが発生しました: " + e.toString());
    logger.log("コンポジション作成中にエラーが発生しました: " + e.toString());
  }

  app.endUndoGroup();
}
