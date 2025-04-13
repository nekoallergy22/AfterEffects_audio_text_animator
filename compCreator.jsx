// compCreator.jsx - コンポジション作成機能を提供するモジュール
function createCompositions() {
  var logger = new Logger("CompCreator");

  if (!jsonData || !jsonData.slide) {
    alert("有効なJSONデータが読み込まれていません。");
    logger.log("有効なJSONデータが読み込まれていません");
    return;
  }

  app.beginUndoGroup("コンポジションの作成");

  try {
    var slideFolder = app.project.items.addFolder("slide");
    logger.log("slideフォルダを作成しました");

    var slideItems = [];
    for (var i = 0; i < jsonData.slide.length; i++) {
      var slideData = jsonData.slide[i];
      var slideName = slideData.name;
      var duration = slideData.duration / 1000;

      var existingComp = findCompByName(slideName);
      var slideComp;

      if (existingComp) {
        slideComp = existingComp;
        logger.log("既存のコンポジションを使用: " + slideName);
      } else {
        slideComp = app.project.items.addComp(
          slideName,
          1920,
          1080,
          1,
          duration,
          30
        );
        logger.log("新しいコンポジションを作成: " + slideName);
      }

      slideComp.parentFolder = slideFolder;
      slideItems.push(slideComp);
    }

    if (jsonData.project && jsonData.project.name) {
      var mainCompName = jsonData.project.name;
      var mainComp = findCompByName(mainCompName);

      if (!mainComp) {
        mainComp = app.project.items.addComp(
          mainCompName,
          1920,
          1080,
          1,
          60,
          30
        );
        logger.log("メインコンポジションを作成: " + mainCompName);
      }

      // 既存のレイヤーを削除
      while (mainComp.numLayers > 0) {
        mainComp.layer(1).remove();
      }

      // 新しいレイヤーを追加
      var currentTime = 0;
      for (var j = 0; j < slideItems.length; j++) {
        var layer = mainComp.layers.add(slideItems[j]);
        layer.startTime = currentTime;
        currentTime += slideItems[j].duration;
      }

      logger.log(
        slideItems.length +
          "個のサブコンポジションをメインコンポジションに追加しました"
      );
    }

    alert(
      jsonData.slide.length +
        "個のコンポジションを作成し、slideフォルダ内に配置しました。"
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

function findCompByName(name) {
  try {
    for (var i = 1; i <= app.project.numItems; i++) {
      var item = app.project.item(i);
      if (item instanceof CompItem && item.name === name) {
        return item;
      }
    }
  } catch (e) {
    var logger = new Logger("CompCreator");
    logger.log("コンポジション検索中にエラーが発生しました: " + e.toString());
  }
  return null;
}
