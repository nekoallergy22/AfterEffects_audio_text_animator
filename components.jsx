// アクティブなコンポジションの全オーディオレイヤーに対してテキストを挿入する関数
function insertTextAll(comp, xPos, yPos) {
  var layers = comp.layers;
  var num_layers = layers.length;
  var audioLayers = [];

  for (var i = 1; i <= num_layers; i++) {
    var layer = layers[i];
    if (layer.hasAudio) {
      audioLayers.push(layer);
    }
  }

  for (var i = audioLayers.length - 1; i >= 0; i--) {
    var layer = audioLayers[i];
    var duration = {
      inPoint: layer.inPoint,
      outPoint: layer.outPoint,
    };
    insertText(
      comp,
      layer.name,
      xPos,
      yPos,
      duration.inPoint,
      duration.outPoint
    );
  }
}

// 指定された名前、位置、開始点、終了点でテキストレイヤーを挿入する関数
function insertText(comp, name, x, y, inPoint, outPoint) {
  // var comp = app.project.activeItem;
  var sentence = name.replace(".mp3", "").slice(5);
  var textLayer = comp.layers.addText(sentence);

  setTextProperties(textLayer, "565656", 30);
  setLayerAnchorPointToCenter(textLayer);

  textLayer.position.setValue([x, y]);
  textLayer.inPoint = inPoint;
  textLayer.outPoint = outPoint;
}

// テキストレイヤーのプロパティを設定する関数
function setTextProperties(layer, hexColor, fontSize) {
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

// レイヤーのアンカーポイントを中央に設定する関数
function setLayerAnchorPointToCenter(layer) {
  layer.property("Transform").property("Anchor Point").expression =
    "b = thisLayer.sourceRectAtTime(); [(b.width/2)+b.left,(b.height/2)+b.top];";
}

//JSONファイルの情報を読み込む関数
function openJsonContents() {
  var file = File.openDialog("Select a JSON file for Comp Duration", "*.json");
  if (file) {
    file.encoding = "UTF-8";
    file.open("r");
    var jsonContent = file.read();
    file.close();
  } else {
    alert("No file selected for Audio Import.");
  }

  return jsonContent;
}

// 新規コンポジションを作成する関数
function createNewComp(name, width, height, pixelAspect, duration, frameRate) {
  comp = app.project.items.addComp(
    name,
    width,
    height,
    pixelAspect,
    duration,
    frameRate
  );
  return comp;
}

// 各コンポジションをシーケンスごとに配置する関数
function sequenceCompLayers(comp) {
  app.beginUndoGroup("Sequence Comp Layers");

  var startTime = 0;

  for (var j = 0; j < comp.numLayers; j++) {
    var layer = comp.layer(j + 1);
    layer.startTime = startTime;
    startTime = layer.outPoint;
  }

  app.endUndoGroup();
}

// オーディオレイヤーをシーケンス状に配置する関数
function sequenceAudioLayers(comp) {
  app.beginUndoGroup("Sequence Audio Layers");

  var audioLayers = [];
  var otherLayers = [];

  for (var i = 1; i <= comp.numLayers; i++) {
    var layer = comp.layer(i);
    var isAudio = layer.hasAudio;
    if (layer.source instanceof FootageItem && isAudio) {
      audioLayers.push(layer);
    } else {
      otherLayers.push(layer);
    }
  }

  //オーディオレイヤーをシーケンス順に配列
  var startTime = 0;
  for (var j = 0; j < audioLayers.length; j++) {
    var layer = audioLayers[j];
    layer.startTime = startTime;
    startTime = layer.outPoint;
  }

  //その他レイヤーの終了点をコンポジションのサイズに調整
  for (var j = 0; j < otherLayers.length; j++) {
    var layer = otherLayers[j];
    layer.outPoint = comp.duration;
  }

  app.endUndoGroup();
}

// プロジェクト内から指定された名前の最初の4文字でファイルを探す関数
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

// ファイルを指定されたコンポジションに配置する関数
function placeFileInComp(file, comp) {
  comp.layers.add(file);
}

// コンポジションを名前で検索する関数
function findCompByName(name) {
  var project = app.project;
  var num_items = project.numItems;
  for (var i = 1; i <= num_items; i++) {
    if (project.item(i) instanceof CompItem && project.item(i).name === name) {
      return project.item(i);
    }
  }

  return null;
}

//コンポジション内のすべてのアイテムにアニメーションを付与する関数
function setAnimetionToAllItem(comp) {
  // app.beginUndoGroup("autoSetFunc");

  // var comp = app.project.activeItem;
  if (comp != null && comp instanceof CompItem) {
    setScaleAnime(comp, "Emoji");
    setScaleAnime(comp, "rafiki");
    setScaleAnime(comp, "icon");
    setScaleAnime(comp, "item");
    trimPaths(comp, "line");
    setOpacityAnimeToTextLayer(comp);
  } else {
    alert("コンポジションが選択されていません。");
  }

  // app.endUndoGroup();
}

// 特定の文字列が含まれているレイヤーをスケールアップする関数
function setScaleAnime(comp, text) {
  // コンポジション内にある名前に「text」が含まれるレイヤーを全て取得
  var handleLayers = [];
  for (var i = 1; i <= comp.numLayers; i++) {
    var layer = comp.layer(i);
    if (layer.name.indexOf(text) !== -1) {
      handleLayers.push(layer);
    }
  }

  // 取得したレイヤーのサイズを変更
  for (var i = 0; i < handleLayers.length; i++) {
    var layer = handleLayers[i];
    var inPoint = layer.inPoint;
    var currentScale = layer.scale.value;

    var scale = layer.transform.scale;
    scale.setValueAtTime(inPoint, [0, 0, 0]);
    scale.setValueAtTime(inPoint + 0.15, currentScale * 1.2);
    scale.setValueAtTime(inPoint + 0.3, currentScale);
  }
}

// 特定の文字列が含まれているレイヤーのラインをトリムする関数
function trimPaths(comp, text) {
  // コンポジション内にある名前に「text」が含まれるレイヤーを全て取得
  var handleLayers = [];
  for (var i = 1; i <= comp.numLayers; i++) {
    var layer = comp.layer(i);
    if (layer.name.indexOf(text) !== -1) {
      handleLayers.push(layer);
    }
  }

  // 選択されたレイヤーを順に処理
  for (var i = 0; i < handleLayers.length; i++) {
    var layer = handleLayers[i];

    // レイヤーがシェイプレイヤーで、パスを含んでいる場合のみ処理
    if (layer instanceof ShapeLayer) {
      // 「パスのトリミング」エフェクトを追加
      var trimPaths = layer.content.addProperty("ADBE Vector Filter - Trim");

      // 現在の時間を取得
      var currentTime = comp.time;

      // レイヤーの開始フレームを取得
      var startFrame = layer.startTime;

      // 開始点のキーフレームを設定
      var start = trimPaths.property("Start");
      start.setValueAtTime(startFrame, 100); // 開始時点の値を100%に
      start.setValueAtTime(startFrame + comp.frameDuration * 20, 0); // 20フレーム後の値を0%に
    }
  }
}

//
function setOpacityAnimeToTextLayer(comp) {
  var layers = comp.layers;

  for (var i = 1; i <= layers.length; i++) {
    var layer = layers[i];

    if (layer.hasOwnProperty("テキスト")) {
      var inPoint = layer.inPoint;
      var currentOpacity = layer.opacity.value;

      var opacity = layer.transform.opacity;
      opacity.setValueAtTime(inPoint, 0);
      opacity.setValueAtTime(inPoint + 0.4, currentOpacity);
    }
  }
}
