/**
 * After Effects Audio Text Animator - Utility Functions
 * 基本的なユーティリティ関数を提供します
 */

/**
 * 16進数カラーコードをRGB値に変換する関数
 * @param {string} hexColor - 16進数カラーコード
 * @return {Array} RGB値の配列
 */
function colorSetToRgb(hexColor) {
  // この関数は元のコードには含まれていませんでしたが、
  // setTextProperties関数で使用されているため、実装が必要です
  var r = parseInt(hexColor.substr(0, 2), 16) / 255;
  var g = parseInt(hexColor.substr(2, 2), 16) / 255;
  var b = parseInt(hexColor.substr(4, 2), 16) / 255;
  return [r, g, b, 1]; // RGBA形式で返す
}

/**
 * JSONファイルの情報を読み込む関数
 * @return {string} JSONファイルの内容
 */
function openJsonContents() {
  var file = File.openDialog("Select a JSON file", "*.json");
  if (file) {
    file.encoding = "UTF-8";
    file.open("r");
    var jsonContent = file.read();
    file.close();
    return jsonContent;
  } else {
    alert("No file selected.");
    return null;
  }
}

/**
 * 新規コンポジションを作成する関数
 * @param {string} name - コンポジション名
 * @param {number} width - 幅
 * @param {number} height - 高さ
 * @param {number} pixelAspect - ピクセルアスペクト比
 * @param {number} duration - 長さ（秒）
 * @param {number} frameRate - フレームレート
 * @return {CompItem} 作成されたコンポジション
 */
function createNewComp(name, width, height, pixelAspect, duration, frameRate) {
  var comp = app.project.items.addComp(
    name,
    width,
    height,
    pixelAspect,
    duration,
    frameRate
  );
  return comp;
}

/**
 * コンポジションを名前で検索する関数
 * @param {string} name - 検索するコンポジション名
 * @return {CompItem|null} 見つかったコンポジションまたはnull
 */
function findCompByName(name) {
  var project = app.project;
  var numItems = project.numItems;

  for (var i = 1; i <= numItems; i++) {
    if (project.item(i) instanceof CompItem && project.item(i).name === name) {
      return project.item(i);
    }
  }

  return null;
}

/**
 * プロジェクト内から指定された名前の最初の4文字でファイルを探す関数
 * @param {string} name - 検索するファイル名の先頭4文字
 * @return {FootageItem|null} 見つかったフッテージアイテムまたはnull
 */
function findFileInProject(name) {
  var items = app.project.items;

  for (var i = 1; i <= items.length; i++) {
    if (
      items[i].name.substring(0, 4) === name &&
      items[i] instanceof FootageItem
    ) {
      return items[i];
    }
  }

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
