// compHandlers.jsx

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
  try {
    Logger.debug("コンポジション作成開始: " + name);

    // デフォルト値の設定
    width = width || DEFAULT_COMP.WIDTH;
    height = height || DEFAULT_COMP.HEIGHT;
    pixelAspect = pixelAspect || DEFAULT_COMP.PIXEL_ASPECT;
    frameRate = frameRate || DEFAULT_COMP.FRAME_RATE;

    var comp = app.project.items.addComp(
      name,
      width,
      height,
      pixelAspect,
      duration,
      frameRate
    );

    Logger.info("コンポジション作成完了: " + name);
    return comp;
  } catch (e) {
    Logger.error("コンポジション作成エラー: " + e.toString());
    return null;
  }
}

/**
 * コンポジションを名前で検索する関数
 * @param {string} name - 検索するコンポジション名
 * @return {CompItem|null} 見つかったコンポジションまたはnull
 */
function findCompByName(name) {
  try {
    var project = app.project;
    var numItems = project.numItems;

    for (var i = 1; i <= numItems; i++) {
      if (
        project.item(i) instanceof CompItem &&
        project.item(i).name === name
      ) {
        Logger.debug("コンポジション検索: " + name + " → 見つかりました");
        return project.item(i);
      }
    }

    Logger.warn("コンポジション検索: " + name + " → 見つかりません");
    return null;
  } catch (e) {
    Logger.error("コンポジション検索エラー: " + e.toString());
    return null;
  }
}

/**
 * 各コンポジションをシーケンスごとに配置する関数
 * @param {CompItem} comp - 対象のコンポジション
 */
function sequenceCompLayers(comp) {
  try {
    app.beginUndoGroup("Sequence Comp Layers");

    // レイヤーを収集
    var layers = [];
    for (var i = 1; i <= comp.numLayers; i++) {
      layers.push(comp.layer(i));
    }

    // 数値的にソート
    layers.sort(function (a, b) {
      // 数値に変換できる場合は数値としてソート
      var aNum = parseInt(a.name);
      var bNum = parseInt(b.name);
      if (!isNaN(aNum) && !isNaN(bNum)) {
        return aNum - bNum; // 昇順ソート
      }
      // 数値に変換できない場合は文字列としてソート
      return a.name.localeCompare(b.name);
    });

    // ソートされたレイヤーをシーケンス状に配置
    var startTime = 0;
    for (var j = 0; j < layers.length; j++) {
      var layer = layers[j];
      layer.startTime = startTime;
      startTime = layer.outPoint;
      Logger.debug(
        "レイヤー配置: " +
          layer.name +
          ", 開始時間: " +
          layer.startTime +
          ", 終了時間: " +
          layer.outPoint
      );
    }

    app.endUndoGroup();
    Logger.info("コンポジションレイヤーのシーケンス配置完了");
  } catch (e) {
    Logger.error("シーケンス配置エラー: " + e.toString());
  }
}

/**
 * コンポジション内のオーディオレイヤー数をカウントする関数
 * @param {CompItem} comp - 対象のコンポジション
 * @return {number} オーディオレイヤーの数
 */
function countAudioLayers(comp) {
  var count = 0;
  for (var i = 1; i <= comp.numLayers; i++) {
    if (comp.layer(i).hasAudio) {
      count++;
    }
  }
  return count;
}
