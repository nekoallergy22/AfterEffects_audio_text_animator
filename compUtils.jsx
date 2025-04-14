// compUtils.jsx - コンポジション作成のユーティリティ関数

// 名前でコンポジションを検索する関数
function findCompByName(name) {
  try {
    for (var i = 1; i <= app.project.numItems; i++) {
      var item = app.project.item(i);
      if (item instanceof CompItem && item.name === name) {
        return item;
      }
    }
  } catch (e) {
    var logger = new Logger("CompUtils");
    logger.log("コンポジション検索中にエラーが発生しました: " + e.toString());
  }
  return null;
}

// slideフォルダを作成する関数
function createSlideFolder() {
  var logger = new Logger("CompUtils");
  var slideFolder = app.project.items.addFolder("slide");
  logger.log("slideフォルダを作成しました");
  return slideFolder;
}

// コンポジションのレイヤーをすべて削除する関数
function clearCompLayers(comp) {
  try {
    while (comp.numLayers > 0) {
      comp.layer(1).remove();
    }
    return true;
  } catch (e) {
    var logger = new Logger("CompUtils");
    logger.log("レイヤー削除中にエラーが発生しました: " + e.toString());
    return false;
  }
}
