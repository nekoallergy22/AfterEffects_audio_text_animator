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
      "コンポジション「" +
        activeComp.name +
        "」の図形アニメーション処理を開始します"
    );

    // アンドゥグループを開始
    app.beginUndoGroup("図形レイヤーのアニメーション適用");

    var shapesAnimated = 0;

    // すべてのレイヤーをチェック
    for (var i = 1; i <= activeComp.numLayers; i++) {
      var layer = activeComp.layer(i);

      // シェイプレイヤーまたはベクターレイヤーかチェック
      if (
        layer.matchName === "ADBE Vector Layer" ||
        layer instanceof ShapeLayer ||
        layer.property("ADBE Root Vectors Group") !== null
      ) {
        // レイヤーの時間的な開始位置を取得
        var layerInPoint = layer.inPoint;

        // スケールプロパティを取得
        var transform = layer.transform;
        var scale = transform.scale;

        // 現在のスケール値を保存
        var currentScale = scale.value;

        // レイヤーの開始時間にキーフレームを追加（0%）
        scale.setValueAtTime(layerInPoint, [0, 0]);

        // 10フレーム後の時間を計算
        var endTime = layerInPoint + 10 / activeComp.frameRate;

        // 10フレーム後にキーフレームを追加（現在のスケール値）
        scale.setValueAtTime(endTime, currentScale);

        // イージングを適用
        for (var j = 1; j <= scale.numKeys; j++) {
          scale.setInterpolationTypeAtKey(j, KeyframeInterpolationType.BEZIER);

          // スケールプロパティの次元数を確認
          var dimensionCount = scale.value.length;
          var easeInArray = [];
          var easeOutArray = [];

          // 次元数に応じたイージング配列を作成
          for (var d = 0; d < dimensionCount; d++) {
            easeInArray.push(new KeyframeEase(0.5, 50));
            easeOutArray.push(new KeyframeEase(0.5, 50));
          }

          // 適切な次元数のイージングを適用
          scale.setTemporalEaseAtKey(j, easeInArray, easeOutArray);
        }

        shapesAnimated++;
        logger.log(
          "レイヤー「" +
            layer.name +
            "」にスケールアニメーションを適用しました（開始時間: " +
            layerInPoint +
            "秒）"
        );
      }
    }

    app.endUndoGroup();

    if (shapesAnimated > 0) {
      alert(
        shapesAnimated + "個の図形レイヤーにアニメーションを適用しました。"
      );
      logger.log(
        shapesAnimated + "個の図形レイヤーにアニメーションを適用しました"
      );
      return true;
    } else {
      alert("アニメーション可能な図形レイヤーが見つかりませんでした。");
      logger.log("アニメーション可能な図形レイヤーが見つかりませんでした");
      return false;
    }
  } catch (e) {
    logger.log(
      "図形アニメーション処理中にエラーが発生しました: " + e.toString()
    );
    alert("エラーが発生しました: " + e.toString());
    return false;
  }
}
