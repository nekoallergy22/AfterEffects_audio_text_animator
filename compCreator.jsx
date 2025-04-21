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
    logger.log("オーディオファイルの配置を開始します");
    var audioResult = addAudioToSubComps(slideItems, jsonData.slide);

    if (audioResult) {
      logger.log("すべてのオーディオファイルが正常に配置されました");
    } else {
      logger.log("一部のオーディオファイルの配置に問題がありました");
    }

    // オーディオ配置の詳細ログ出力
    for (var i = 0; i < jsonData.slide.length; i++) {
      var slideData = jsonData.slide[i];
      if (slideData.audio_list && slideData.audio_list.length > 0) {
        logger.log(
          "スライド " +
            slideData.name +
            " のオーディオID一覧: " +
            slideData.audio_list.join(", ")
        );
      }
    }

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
