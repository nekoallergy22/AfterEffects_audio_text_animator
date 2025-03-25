/**
 * After Effects Audio Text Animator - Text Handling Functions
 * テキスト処理関連の機能を提供します
 */

/**
 * アクティブなコンポジションの全オーディオレイヤーに対してテキストを挿入する関数
 * @param {CompItem} comp - 対象のコンポジション
 * @param {number} xPos - X座標
 * @param {number} yPos - Y座標
 */
function insertTextForAllAudioLayers(comp, xPos, yPos) {
  var layers = comp.layers;
  var numLayers = layers.length;
  var audioLayers = [];

  // オーディオレイヤーを収集
  for (var i = 1; i <= numLayers; i++) {
    var layer = layers[i];
    if (layer.hasAudio) {
      audioLayers.push(layer);
    }
  }

  // 各オーディオレイヤーに対してテキストを挿入
  for (var i = audioLayers.length - 1; i >= 0; i--) {
    var layer = audioLayers[i];
    var duration = {
      inPoint: layer.inPoint,
      outPoint: layer.outPoint,
    };
    insertTextLayer(
      comp,
      layer.name,
      xPos,
      yPos,
      duration.inPoint,
      duration.outPoint
    );
  }
}

/**
 * 指定された名前、位置、開始点、終了点でテキストレイヤーを挿入する関数
 * @param {CompItem} comp - 対象のコンポジション
 * @param {string} name - テキストの元となるファイル名
 * @param {number} x - X座標
 * @param {number} y - Y座標
 * @param {number} inPoint - 開始時間
 * @param {number} outPoint - 終了時間
 * @return {TextLayer} 作成されたテキストレイヤー
 */
function insertTextLayer(comp, name, x, y, inPoint, outPoint) {
  // ファイル名から表示テキストを生成
  var displayText = name.replace(".mp3", "").slice(5);
  var textLayer = comp.layers.addText(displayText);

  // テキストのプロパティを設定
  setTextLayerProperties(textLayer, "565656", 30);
  setLayerAnchorPointToCenter(textLayer);

  // 位置と時間を設定
  textLayer.position.setValue([x, y]);
  textLayer.inPoint = inPoint;
  textLayer.outPoint = outPoint;

  return textLayer;
}

/**
 * テキストレイヤーのプロパティを設定する関数
 * @param {TextLayer} layer - 対象のテキストレイヤー
 * @param {string} hexColor - 16進数カラーコード
 * @param {number} fontSize - フォントサイズ
 */
function setTextLayerProperties(layer, hexColor, fontSize) {
  var color = colorSetToRgb(hexColor);
  var textProp = layer
    .property("ADBE Text Properties")
    .property("ADBE Text Document");
  var textValue = textProp.value;
  textValue.applyFill = true;
  textValue.fillColor = color;
  textValue.fontSize = fontSize;
  textProp.setValue(textValue);
}
