// fileHandlers.jsx

/**
 * JSONファイルの内容を読み込む関数
 * @return {string} JSONファイルの内容
 */
function openJsonContents() {
  var file = File.openDialog("JSONファイルを選択", "*.json");
  if (file) {
    file.encoding = "UTF-8";
    file.open("r");
    var jsonContent = file.read();
    file.close();
    return jsonContent;
  } else {
    Logger.warn("ファイルが選択されませんでした。");
    return null;
  }
}

/**
 * プロジェクト内のファイルを名前で検索する関数
 * @param {string} name - 検索するファイル名
 * @return {FootageItem} 見つかったファイルアイテム、見つからない場合はnull
 */
function findFileInProject(name) {
  var project = app.project;
  for (var i = 1; i <= project.numItems; i++) {
    var item = project.item(i);
    if (item instanceof FootageItem && item.name === name) {
      Logger.info("ファイル検索: " + name + " → 完全一致: " + item.name);
      return item;
    }
  }
  for (var i = 1; i <= project.numItems; i++) {
    var item = project.item(i);
    if (item instanceof FootageItem && item.name.indexOf(name) !== -1) {
      Logger.info("ファイル検索: " + name + " → 部分一致: " + item.name);
      return item;
    }
  }
  Logger.warn("ファイル検索: " + name + " → 見つかりません");
  return null;
}

/**
 * ファイルを指定されたコンポジションに配置する関数
 * @param {FootageItem} file - 配置するファイル
 * @param {CompItem} comp - 対象のコンポジション
 * @return {Layer} 追加されたレイヤー
 */
function placeFileInComp(file, comp) {
  return comp.layers.add(file);
}
