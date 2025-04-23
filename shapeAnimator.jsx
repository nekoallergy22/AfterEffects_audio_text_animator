// shapeAnimator.jsx - 図形アニメーション機能を提供するモジュール

function animateShapeLayers() {
  var logger = new Logger("ShapeAnimator");

  try {
    // アクティブなコンポジションを取得
    var activeComp = app.project.activeItem;

    if (!(activeComp instanceof CompItem)) {
      alert(
        "アクティブなコンポジションがありません。コンポジションを選択してください。"
      );
      logger.log("アクティブなコンポジションがありません");
      return false;
    }

    logger.log(
      "メインコンポジション「" +
        activeComp.name +
        "」のサブコンポジションにアニメーションを適用します"
    );

    // アンドゥグループを開始
    app.beginUndoGroup("レイヤーのアニメーション適用");

    // 集合体としてのコンポジションリスト
    var compList = [];
    compList.push(activeComp); // メインコンポジションも含める

    // サブコンポジションを探す
    for (var i = 1; i <= activeComp.numLayers; i++) {
      var layer = activeComp.layer(i);
      if (layer.source && layer.source instanceof CompItem) {
        compList.push(layer.source);
      }
    }

    // 重複を排除
    var uniqueComps = [];
    var compNames = {};
    for (var j = 0; j < compList.length; j++) {
      var comp = compList[j];
      if (!compNames[comp.name]) {
        uniqueComps.push(comp);
        compNames[comp.name] = true;
      }
    }

    // 各コンポジションに対してアニメーションを適用
    var totalShapesAnimated = 0;
    var totalTextLayersAnimated = 0;
    var totalLayersExtended = 0;

    for (var k = 0; k < uniqueComps.length; k++) {
      var comp = uniqueComps[k];
      var result = animateLayersInComp(comp);
      totalShapesAnimated += result.shapesAnimated;
      totalTextLayersAnimated += result.textLayersAnimated;

      // シェイプレイヤーのout点をコンポジションの長さに合わせる
      var extendResult = extendLayersToCompDuration(comp);
      totalLayersExtended += extendResult;
    }

    // 最終的な結果のログ
    logger.log(
      "合計: " +
        uniqueComps.length +
        "個のコンポジションに" +
        (totalShapesAnimated + totalTextLayersAnimated) +
        "個のアニメーションを適用し、" +
        totalLayersExtended +
        "個のレイヤーの長さを調整しました。"
    );

    app.endUndoGroup();

    var totalAnimated = totalShapesAnimated + totalTextLayersAnimated;

    if (totalAnimated > 0 || totalLayersExtended > 0) {
      var message = uniqueComps.length + "個のコンポジションに対して、";
      if (totalShapesAnimated > 0) {
        message += totalShapesAnimated + "個の図形レイヤー";
      }
      if (totalTextLayersAnimated > 0) {
        if (totalShapesAnimated > 0) message += "と";
        message += totalTextLayersAnimated + "個のテキストレイヤー";
      }
      message += "にアニメーションを適用し、";
      message +=
        totalLayersExtended +
        "個のレイヤーの長さをコンポジションに合わせました。";

      alert(message);
      return true;
    } else {
      alert("アニメーション可能なレイヤーが見つかりませんでした。");
      logger.log("アニメーション可能なレイヤーが見つかりませんでした");
      return false;
    }
  } catch (e) {
    logger.log("アニメーション処理中にエラーが発生しました: " + e.toString());
    alert("エラーが発生しました: " + e.toString());
    return false;
  }
}

// レイヤーの長さをコンポジションの長さに合わせる関数
function extendLayersToCompDuration(comp) {
  var logger = new Logger("ShapeAnimator");
  var layersExtended = 0;

  for (var i = 1; i <= comp.numLayers; i++) {
    var layer = comp.layer(i);

    // オーディオレイヤー以外のレイヤーを処理
    // AudioItemは未定義なので、hasAudioプロパティを使用
    if (!layer.hasAudio || (layer.hasVideo && layer.hasAudio)) {
      // レイヤーのout点をコンポジションの長さに合わせる
      var currentOutPoint = layer.outPoint;

      if (currentOutPoint < comp.duration) {
        layer.outPoint = comp.duration;
        layersExtended++;
      }
    }
  }

  logger.log(
    "スライド「" +
      comp.name +
      "」の" +
      layersExtended +
      "個のレイヤー長さを調整しました。"
  );
  return layersExtended;
}

// 特定のコンポジション内のレイヤーにアニメーションを適用する関数
function animateLayersInComp(comp) {
  var logger = new Logger("ShapeAnimator");
  var shapesAnimated = 0;
  var textLayersAnimated = 0;

  for (var i = 1; i <= comp.numLayers; i++) {
    var layer = comp.layer(i);
    var layerInPoint = layer.inPoint;

    if (isShapeLayer(layer)) {
      applyScaleAnimation(layer, layerInPoint, comp.frameRate);
      shapesAnimated++;
    } else if (layer instanceof TextLayer) {
      applyOpacityAnimation(layer, layerInPoint, comp.frameRate);
      textLayersAnimated++;
    }
  }

  var totalAnimated = shapesAnimated + textLayersAnimated;
  if (totalAnimated > 0) {
    logger.log(
      "スライド「" +
        comp.name +
        "」に" +
        totalAnimated +
        "個のアニメーションを適用しました。"
    );
  }

  return {
    shapesAnimated: shapesAnimated,
    textLayersAnimated: textLayersAnimated,
  };
}

// シェイプレイヤーかどうかを判定する関数
function isShapeLayer(layer) {
  return (
    layer.matchName === "ADBE Vector Layer" ||
    layer instanceof ShapeLayer ||
    layer.property("ADBE Root Vectors Group") !== null
  );
}

// スケールアニメーションを適用する関数
function applyScaleAnimation(layer, startTime, frameRate) {
  var transform = layer.transform;
  var scale = transform.scale;

  // 現在のスケール値を保存
  var currentScale = scale.value;

  // レイヤーの開始時間にキーフレームを追加（0%）
  scale.setValueAtTime(startTime, [0, 0]);

  // 10フレーム後の時間を計算
  var endTime = startTime + 10 / frameRate;

  // 10フレーム後にキーフレームを追加（現在のスケール値）
  scale.setValueAtTime(endTime, currentScale);

  // イージングを適用
  applyEasing(scale);
}

// 不透明度アニメーションを適用する関数
function applyOpacityAnimation(layer, startTime, frameRate) {
  var opacity = layer.transform.opacity;

  // 現在の不透明度値を保存
  var currentOpacity = opacity.value;

  // レイヤーの開始時間にキーフレームを追加（0%）
  opacity.setValueAtTime(startTime, 0);

  // 10フレーム後の時間を計算
  var endTime = startTime + 10 / frameRate;

  // 10フレーム後にキーフレームを追加（現在の不透明度値）
  opacity.setValueAtTime(endTime, currentOpacity);

  // イージングを適用
  applyEasing(opacity);
}

// イージングを適用する関数
function applyEasing(property) {
  for (var j = 1; j <= property.numKeys; j++) {
    property.setInterpolationTypeAtKey(j, KeyframeInterpolationType.BEZIER);

    // プロパティの種類に応じたイージング適用
    if (property.value instanceof Array) {
      // 配列型プロパティ（スケールなど）
      var dimensionCount = property.value.length;
      var easeInArray = [];
      var easeOutArray = [];

      // 次元数に応じたイージング配列を作成
      for (var d = 0; d < dimensionCount; d++) {
        easeInArray.push(new KeyframeEase(0.5, 50));
        easeOutArray.push(new KeyframeEase(0.5, 50));
      }

      // 適切な次元数のイージングを適用
      property.setTemporalEaseAtKey(j, easeInArray, easeOutArray);
    } else {
      // 単一値プロパティ（不透明度など）
      property.setTemporalEaseAtKey(
        j,
        [new KeyframeEase(0.5, 50)],
        [new KeyframeEase(0.5, 50)]
      );
    }
  }
}
