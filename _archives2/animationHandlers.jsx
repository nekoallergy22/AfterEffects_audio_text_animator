// animationHandlers.jsx

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
      var aNum = parseInt(a.name);
      var bNum = parseInt(b.name);
      if (!isNaN(aNum) && !isNaN(bNum)) {
        return aNum - bNum;
      }
      return a.name.localeCompare(b.name);
    });

    // シーケンス配置
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
 * オーディオレイヤーをシーケンス状に配置する関数
 * @param {CompItem} comp - 対象のコンポジション
 */
function sequenceAudioLayers(comp) {
  try {
    app.beginUndoGroup("Sequence Audio Layers");

    var audioLayers = [];
    var otherLayers = [];

    // レイヤーを分類
    for (var i = 1; i <= comp.numLayers; i++) {
      var layer = comp.layer(i);
      if (layer.hasAudio && layer.source instanceof FootageItem) {
        audioLayers.push(layer);
      } else {
        otherLayers.push(layer);
      }
    }

    // オーディオレイヤーをシーケンス配置
    var startTime = 0;
    for (var j = 0; j < audioLayers.length; j++) {
      var layer = audioLayers[j];
      layer.startTime = startTime;
      startTime = layer.outPoint;
      Logger.info(
        "オーディオレイヤー時間配置: " +
          layer.name +
          ", 開始時間: " +
          layer.startTime +
          ", 終了時間: " +
          layer.outPoint
      );
    }

    // その他レイヤーの終了点をコンポジションのサイズに調整
    for (var j = 0; j < otherLayers.length; j++) {
      var layer = otherLayers[j];
      layer.outPoint = comp.duration;
    }

    app.endUndoGroup();
  } catch (e) {
    Logger.error("オーディオシーケンス配置エラー: " + e.toString());
  }
}

/**
 * テキストレイヤーにフェードインアニメーションを適用する関数
 * @param {CompItem} comp - 対象のコンポジション
 * @param {boolean} showAlerts - アラートを表示するかどうか
 */
function applyOpacityAnimationToTextLayers(comp, showAlerts) {
  showAlerts = showAlerts === undefined ? false : showAlerts;
  Logger.info(
    "テキストレイヤーにアニメーション適用開始: コンポジション " + comp.name
  );

  if (showAlerts) {
    customAlert(
      "テキストレイヤーにアニメーション適用開始: コンポジション " + comp.name
    );
  }

  var layers = comp.layers;
  var animatedLayerCount = 0;

  for (var i = 1; i <= layers.length; i++) {
    try {
      var layer = layers[i];
      if (layer.matchName === "ADBE Text Layer") {
        var inPoint = layer.inPoint;
        var currentOpacity = layer.opacity.value;
        var opacity = layer.transform.opacity;
        opacity.setValueAtTime(inPoint, 0);
        opacity.setValueAtTime(
          inPoint + DEFAULT_ANIMATION.FADE_IN_DURATION,
          currentOpacity
        );
        animatedLayerCount++;
      }
    } catch (e) {
      var errorMessage = "テキストアニメーション適用エラー: " + e.toString();
      Logger.error(errorMessage);
      if (showAlerts) {
        customAlert(errorMessage, "エラー");
      }
    }
  }

  Logger.info(
    "アニメーションを適用したテキストレイヤー数: " + animatedLayerCount
  );
  if (showAlerts) {
    customAlert(
      "アニメーションを適用したテキストレイヤー数: " + animatedLayerCount
    );
  }

  return animatedLayerCount;
}

/**
 * テキストレイヤーにスケールアップアニメーションを適用する関数
 * @param {CompItem} comp - 対象のコンポジション
 */
function applyScaleAnimationToTextLayers(comp) {
  try {
    var layers = comp.layers;
    var animatedLayerCount = 0;

    for (var i = 1; i <= layers.length; i++) {
      var layer = layers[i];
      if (layer.matchName === "ADBE Text Layer") {
        var inPoint = layer.inPoint;
        var currentScale = layer.scale.value;
        var scale = layer.transform.scale;
        scale.setValueAtTime(inPoint, [0, 0, 0]);
        scale.setValueAtTime(
          inPoint + DEFAULT_ANIMATION.SCALE_UP_DURATION / 2,
          [currentScale[0] * 1.2, currentScale[1] * 1.2, currentScale[2]]
        );
        scale.setValueAtTime(
          inPoint + DEFAULT_ANIMATION.SCALE_UP_DURATION,
          currentScale
        );
        animatedLayerCount++;
      }
    }

    Logger.info(
      "スケールアニメーションを適用したテキストレイヤー数: " +
        animatedLayerCount
    );
    return animatedLayerCount;
  } catch (e) {
    Logger.error("スケールアニメーション適用エラー: " + e.toString());
    return 0;
  }
}

/**
 * すべてのアニメーションを適用する関数
 * @param {CompItem} comp - 対象のコンポジション
 * @param {boolean} showAlerts - アラートを表示するかどうか
 */
function applyAnimationsToAllItems(comp, showAlerts) {
  showAlerts = showAlerts === undefined ? false : showAlerts;

  try {
    // 不透明度アニメーション
    applyOpacityAnimationToTextLayers(comp, showAlerts);

    // スケールアニメーション
    applyScaleAnimationToTextLayers(comp);

    Logger.info("すべてのアニメーション適用完了: コンポジション " + comp.name);
    return true;
  } catch (e) {
    Logger.error("アニメーション適用エラー: " + e.toString());
    return false;
  }
}
