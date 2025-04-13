// textHandlers.jsx

function insertTextForAllAudioLayers(comp, xPos, yPos, showAlerts) {
  showAlerts = showAlerts === undefined ? false : showAlerts;
  Logger.info("テキスト挿入開始: コンポジション " + comp.name);
  if (showAlerts) {
    customAlert("テキスト挿入開始: コンポジション " + comp.name);
  }

  var layers = comp.layers;
  var audioLayers = [];
  var textLayersAdded = 0;

  for (var i = 1; i <= layers.length; i++) {
    if (layers[i].hasAudio) {
      audioLayers.push(layers[i]);
    }
  }

  Logger.info("検出されたオーディオレイヤー数: " + audioLayers.length);
  if (showAlerts) {
    customAlert("検出されたオーディオレイヤー数: " + audioLayers.length);
  }

  for (var i = audioLayers.length - 1; i >= 0; i--) {
    try {
      var layer = audioLayers[i];
      var duration = {
        inPoint: layer.inPoint,
        outPoint: layer.outPoint,
      };
      Logger.debug(
        "テキスト挿入中: レイヤー " +
          layer.name +
          " (" +
          (audioLayers.length - i) +
          "/" +
          audioLayers.length +
          ")"
      );
      var textLayer = insertTextLayer(
        comp,
        layer.name,
        xPos,
        yPos,
        duration.inPoint,
        duration.outPoint
      );
      if (textLayer) {
        textLayersAdded++;
      }
    } catch (e) {
      var errorMessage = "テキスト挿入エラー: " + e.toString();
      Logger.error(errorMessage);
      customAlert(errorMessage, "エラー");
    }
  }

  Logger.info("挿入されたテキストレイヤー数: " + textLayersAdded);
  if (showAlerts) {
    customAlert("挿入されたテキストレイヤー数: " + textLayersAdded);
  }

  return textLayersAdded;
}

function insertTextLayer(comp, name, x, y, inPoint, outPoint) {
  try {
    Logger.debug("テキストレイヤー挿入開始: " + name);
    var displayText = name.replace(".mp3", "").slice(5);
    var textLayer = comp.layers.addText(displayText);
    Logger.debug("テキストレイヤー作成: " + displayText);
    setTextLayerProperties(textLayer, 30);
    setLayerAnchorPointToCenter(textLayer);
    textLayer.position.setValue([x, y]);
    textLayer.inPoint = inPoint;
    textLayer.outPoint = outPoint;
    Logger.debug("テキストレイヤー設定完了: " + displayText);
    return textLayer;
  } catch (e) {
    Logger.error("テキストレイヤー挿入エラー: " + e.toString());
    return null;
  }
}

function setTextLayerProperties(layer, fontSize) {
  try {
    var textProp = layer
      .property("ADBE Text Properties")
      .property("ADBE Text Document");
    var textValue = textProp.value;
    textValue.applyFill = true;
    textValue.fillColor = [0.337, 0.337, 0.337];
    textValue.fontSize = fontSize;
    textProp.setValue(textValue);
    Logger.debug("テキストプロパティ設定完了");
  } catch (e) {
    Logger.error("テキストプロパティ設定エラー: " + e.toString());
  }
}
