// mainCompCreator.jsx - メインコンポジション作成機能

// メインコンポジションを作成する関数
function createMainComposition(name, slideItems, totalDuration) {
  var logger = new Logger("MainCompCreator");

  // バッファー時間（10秒）を加算
  // var mainCompDuration = totalDuration + 10;
  var mainCompDuration = totalDuration + 20;

  // メインコンポジションを作成または更新
  var mainComp = createOrUpdateMainComp(name, mainCompDuration);

  // メインコンポジションにスライドアイテムを配置（ここではスライド間のみ）
  arrangeSlideItemsInMainComp(mainComp, slideItems);

  logger.log(
    slideItems.length +
      "個のサブコンポジションをメインコンポジションに追加しました"
  );

  return mainComp;
}

// メインコンポジションを作成または更新する関数
function createOrUpdateMainComp(name, duration) {
  var logger = new Logger("MainCompCreator");
  var mainComp = findCompByName(name);

  if (!mainComp) {
    mainComp = app.project.items.addComp(name, 1920, 1080, 1, duration, 30);
    logger.log(
      "メインコンポジションを作成: " + name + " (時間: " + duration + "秒)"
    );
  } else {
    // 既存のコンポジションの場合は時間を更新
    mainComp.duration = duration;
    logger.log("既存のメインコンポジションの時間を更新: " + duration + "秒");
  }

  // 既存のレイヤーを削除
  clearCompLayers(mainComp);

  return mainComp;
}

// メインコンポジションにスライドアイテムを配置する関数
function arrangeSlideItemsInMainComp(mainComp, slideItems) {
  var logger = new Logger("MainCompCreator");

  try {
    // baseコンポ追加（アニメーション適用対象外）
    var baseComp = findCompByName("base");
    if (baseComp) {
      var baseLayer = mainComp.layers.add(baseComp);
      baseLayer.moveToEnd();
    }

    // slideItemsのレイヤー追加＆アニメーション適用（1回だけ）
    var currentTime = 0;
    for (var j = 0; j < slideItems.length; j++) {
      var layer = mainComp.layers.add(slideItems[j]);
      layer.startTime = currentTime;
      applyInOutOpacityTransition(layer, mainComp.frameRate); // ここでアニメーション適用
      currentTime += slideItems[j].duration;
    }

    // endコンポ追加（slideItemsの後に追加）
    var endComp = findCompByName("end");
    if (endComp) {
      var endLayer = mainComp.layers.add(endComp);
      endLayer.startTime = currentTime;
    }

    logger.log("スライドアイテムをメインコンポジションに配置しました");
    return true;
  } catch (e) {
    logger.log("スライドアイテム配置中にエラーが発生しました: " + e.toString());
    return false;
  }
}
