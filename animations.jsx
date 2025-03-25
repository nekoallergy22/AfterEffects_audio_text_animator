/**
 * After Effects Audio Text Animator - Animation Functions
 * アニメーション関連の機能を提供します
 */

/**
 * 各コンポジションをシーケンスごとに配置する関数
 * @param {CompItem} comp - 対象のコンポジション
 */
function sequenceCompLayers(comp) {
  app.beginUndoGroup("Sequence Comp Layers");

  // レイヤーを名前で数値的にソート（1, 2, 3, ..., 10, 11, 12のように）
  var layers = [];
  for (var i = 1; i <= comp.numLayers; i++) {
    layers.push(comp.layer(i));
  }

  // 数値的にソート（コンポ名が数字の場合）
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

  // レイヤー名のリストを作成（mapを使わない）
  var layerNames = "";
  for (var i = 0; i < layers.length; i++) {
    if (i > 0) {
      layerNames += ", ";
    }
    layerNames += layers[i].name;
  }

  Logger.info("コンポジションレイヤーをソート: " + layerNames);

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
}

/**
 * オーディオレイヤーをシーケンス状に配置する関数
 * @param {CompItem} comp - 対象のコンポジション
 */
function sequenceAudioLayers(comp) {
  app.beginUndoGroup("Sequence Audio Layers");

  var audioLayers = [];
  var otherLayers = [];

  // レイヤーを分類
  for (var i = 1; i <= comp.numLayers; i++) {
    var layer = comp.layer(i);
    var isAudio = layer.hasAudio;
    if (layer.source instanceof FootageItem && isAudio) {
      audioLayers.push(layer);
    } else {
      otherLayers.push(layer);
    }
  }

  // オーディオレイヤーをシーケンス順に配置
  var startTime = 0;
  for (var j = 0; j < audioLayers.length; j++) {
    var layer = audioLayers[j];
    layer.startTime = startTime;
    startTime = layer.outPoint;
  }

  // その他レイヤーの終了点をコンポジションのサイズに調整
  for (var j = 0; j < otherLayers.length; j++) {
    var layer = otherLayers[j];
    layer.outPoint = comp.duration;
  }

  app.endUndoGroup();
}

/**
 * レイヤーのアンカーポイントを中央に設定する関数
 * @param {Layer} layer - 対象のレイヤー
 */
function setLayerAnchorPointToCenter(layer) {
  layer.property("Transform").property("Anchor Point").expression =
    "b = thisLayer.sourceRectAtTime(); [(b.width/2)+b.left,(b.height/2)+b.top];";
}

/**
 * コンポジション内のすべてのアイテムにアニメーションを付与する関数
 * @param {CompItem} comp - 対象のコンポジション
 * @param {boolean} showAlerts - アラートを表示するかどうか
 */
function applyAnimationsToAllItems(comp, showAlerts) {
  // デフォルト値の設定
  showAlerts = showAlerts === undefined ? false : showAlerts;

  if (comp != null && comp instanceof CompItem) {
    applyScaleAnimation(comp, "Emoji");
    applyScaleAnimation(comp, "rafiki");
    applyScaleAnimation(comp, "icon");
    applyScaleAnimation(comp, "item");
    applyTrimPathsAnimation(comp, "line");
    applyOpacityAnimationToTextLayers(comp, showAlerts);
  } else {
    var errorMessage = "コンポジションが選択されていません。";
    Logger.error(errorMessage);
    customAlert(errorMessage, "エラー"); // エラー時は常にアラート表示
  }
}

/**
 * 特定の文字列が含まれているレイヤーをスケールアップする関数
 * @param {CompItem} comp - 対象のコンポジション
 * @param {string} text - 検索するテキスト
 */
function applyScaleAnimation(comp, text) {
  // コンポジション内にある名前に「text」が含まれるレイヤーを全て取得
  var targetLayers = [];
  for (var i = 1; i <= comp.numLayers; i++) {
    var layer = comp.layer(i);
    if (layer.name.indexOf(text) !== -1) {
      targetLayers.push(layer);
    }
  }

  // 取得したレイヤーのサイズを変更
  for (var i = 0; i < targetLayers.length; i++) {
    var layer = targetLayers[i];
    var inPoint = layer.inPoint;
    var currentScale = layer.scale.value;

    var scale = layer.transform.scale;
    scale.setValueAtTime(inPoint, [0, 0, 0]);
    scale.setValueAtTime(inPoint + 0.15, currentScale * 1.2);
    scale.setValueAtTime(inPoint + 0.3, currentScale);
  }
}

/**
 * 特定の文字列が含まれているレイヤーのラインをトリムする関数
 * @param {CompItem} comp - 対象のコンポジション
 * @param {string} text - 検索するテキスト
 */
function applyTrimPathsAnimation(comp, text) {
  // コンポジション内にある名前に「text」が含まれるレイヤーを全て取得
  var targetLayers = [];
  for (var i = 1; i <= comp.numLayers; i++) {
    var layer = comp.layer(i);
    if (layer.name.indexOf(text) !== -1) {
      targetLayers.push(layer);
    }
  }

  // 選択されたレイヤーを順に処理
  for (var i = 0; i < targetLayers.length; i++) {
    var layer = targetLayers[i];

    // レイヤーがシェイプレイヤーで、パスを含んでいる場合のみ処理
    if (layer instanceof ShapeLayer) {
      // 「パスのトリミング」エフェクトを追加
      var trimPaths = layer.content.addProperty("ADBE Vector Filter - Trim");

      // レイヤーの開始フレームを取得
      var startFrame = layer.startTime;

      // 開始点のキーフレームを設定
      var start = trimPaths.property("Start");
      start.setValueAtTime(startFrame, 100); // 開始時点の値を100%に
      start.setValueAtTime(startFrame + comp.frameDuration * 20, 0); // 20フレーム後の値を0%に
    }
  }
}

/**
 * テキストレイヤーにフェードインアニメーションを適用する関数
 * @param {CompItem} comp - 対象のコンポジション
 * @param {boolean} showAlerts - アラートを表示するかどうか
 */
function applyOpacityAnimationToTextLayers(comp, showAlerts) {
  // デフォルト値の設定
  showAlerts = showAlerts === undefined ? false : showAlerts;

  // ログ出力
  Logger.info(
    "テキストレイヤーにアニメーション適用開始: コンポジション " + comp.name
  );

  // アラート表示（ステップモードのみ）
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

      // TextLayerかどうかを正しく判定
      if (layer.matchName === "ADBE Text Layer") {
        var inPoint = layer.inPoint;
        var currentOpacity = layer.opacity.value;

        var opacity = layer.transform.opacity;
        opacity.setValueAtTime(inPoint, 0);
        opacity.setValueAtTime(inPoint + 0.4, currentOpacity);

        animatedLayerCount++;
      }
    } catch (e) {
      var errorMessage = "テキストアニメーション適用エラー: " + e.toString();
      Logger.error(errorMessage);
      customAlert(errorMessage, "エラー"); // エラー時は常にアラート表示
    }
  }

  Logger.info(
    "アニメーションを適用したテキストレイヤー数: " + animatedLayerCount
  );

  // アラート表示（ステップモードのみ）
  if (showAlerts) {
    customAlert(
      "アニメーションを適用したテキストレイヤー数: " + animatedLayerCount
    );
  }
}
