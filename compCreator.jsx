// compCreator.jsx
function createCompositions() {
  var logger = new Logger("CompCreator");

  if (!jsonData || !jsonData.comp) {
    alert("有効なJSONデータが読み込まれていません。");
    logger.log("有効なJSONデータが読み込まれていません");
    return;
  }

  app.beginUndoGroup("コンポジションの作成");

  try {
    var compFolder = app.project.items.addFolder("comp");
    logger.log("compフォルダを作成しました");

    var compItems = [];
    for (var i = 0; i < jsonData.comp.length; i++) {
      var compData = jsonData.comp[i];
      var compName = compData.name;
      var duration = compData.duration / 1000;

      var existingComp = findCompByName(compName);
      var comp;
      if (existingComp) {
        comp = existingComp;
        logger.log("既存のコンポジションを使用: " + compName);
      } else {
        comp = app.project.items.addComp(compName, 1920, 1080, 1, duration, 30);
        logger.log("新しいコンポジションを作成: " + compName);
      }

      comp.parentFolder = compFolder;
      compItems.push(comp);
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

      for (var j = 0; j < compItems.length; j++) {
        mainComp.layers.add(compItems[j]);
      }

      logger.log(
        compItems.length +
          "個のサブコンポジションをメインコンポジションに追加しました"
      );
    }

    alert(
      jsonData.comp.length +
        "個のコンポジションを作成し、compフォルダ内に配置しました。"
    );
    logger.log(
      jsonData.comp.length +
        "個のコンポジションを作成し、compフォルダ内に配置しました"
    );
  } catch (e) {
    alert("コンポジション作成中にエラーが発生しました: " + e.toString());
    logger.log("コンポジション作成中にエラーが発生しました: " + e.toString());
  }

  app.endUndoGroup();
}

function findCompByName(name) {
  for (var i = 1; i <= app.project.numItems; i++) {
    var item = app.project.item(i);
    if (item instanceof CompItem && item.name === name) {
      return item;
    }
  }
  return null;
}
