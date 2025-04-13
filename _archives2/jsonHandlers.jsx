// jsonHandlers.jsx

function processJSONForCompDuration() {
  resetCancellationFlag();
  customAlert("コンポジション長設定処理を開始します...");
  var jsonContent = openJsonContents();
  if (!jsonContent) return;
  try {
    var data = JSON.parse(jsonContent);
    var projData = data.project;
    var compData = data.comp;
    var compNotFound = [];
    var mainDuration = compData.reduce(
      (sum, comp) => sum + comp.duration / 1000,
      0
    );
    var mainComp =
      findCompByName(projData.name) ||
      createNewComp(projData.name, 1920, 1080, 1, mainDuration, 24);
    if (isProcessingCancelled()) return;
    compData.sort((a, b) => parseInt(a.comp_id) - parseInt(b.comp_id));
    var processedComps = 0;
    for (var i = 0; i < compData.length; i++) {
      if (isProcessingCancelled()) return;
      var compId = compData[i].comp_id.toString();
      var compDuration = compData[i].duration / 1000;
      var comp = findCompByName(compId);
      if (comp) {
        comp.duration = compDuration;
        placeFileInComp(comp, mainComp);
        processedComps++;
      } else {
        compNotFound.push(compId);
      }
    }
    sequenceCompLayers(mainComp);
    var resultMessage =
      compNotFound.length > 0
        ? "以下のコンポジションが見つかりませんでした: " +
          compNotFound.join(", ")
        : "すべてのコンポジション長さを更新しました。処理数: " + processedComps;
    customAlert(resultMessage, "処理完了");
  } catch (e) {
    Logger.error("コンポジション長設定エラー: " + e.toString());
    customAlert("エラーが発生しました: " + e.toString(), "エラー");
  }
}

function processJSONForAudioImport() {
  resetCancellationFlag();
  customAlert("オーディオインポート処理を開始します...");
  var jsonContent = openJsonContents();
  if (!jsonContent) return;
  try {
    var data = JSON.parse(jsonContent);
    var audioData = data.audio;
    var compData = data.comp;
    var fileNotFound = [];
    var compNotFound = [];
    compData.sort((a, b) => parseInt(a.comp_id) - parseInt(b.comp_id));
    audioData.sort((a, b) => parseInt(a.comp_id) - parseInt(b.comp_id));
    var compAudioMap = {};
    audioData.forEach((audioItem) => {
      var compId = audioItem.comp_id.toString();
      if (!compAudioMap[compId]) compAudioMap[compId] = [];
      compAudioMap[compId].push(audioItem);
    });
    var audioPlacedCount = 0;
    Object.keys(compAudioMap).forEach((compId) => {
      if (isProcessingCancelled()) return;
      var targetComp = findCompByName(compId);
      if (!targetComp) {
        compNotFound.push(compId);
        return;
      }
      var compAudioFiles = compAudioMap[compId];
      compAudioFiles.sort((a, b) => a.audio_id - b.audio_id);
      targetComp.layers
        .filter(
          (layer) => layer.hasAudio && layer.source instanceof FootageItem
        )
        .forEach((layer) => layer.remove());
      compAudioFiles.forEach((audioItem, index) => {
        var audioFile = findFileInProject(audioItem.name);
        if (audioFile) {
          targetComp.layers.add(audioFile, index + 1);
          audioPlacedCount++;
        } else {
          fileNotFound.push(audioItem.name);
        }
      });
    });
    customAlert("配置されたオーディオファイル数: " + audioPlacedCount);
    var numCompData = compData.length;
    var processedComps = 0;
    var textLayersAdded = 0;
    for (var i = 0; i < numCompData; i++) {
      if (isProcessingCancelled()) return;
      var compId = compData[i].comp_id.toString();
      var targetComp = findCompByName(compId);
      if (targetComp) {
        sequenceAudioLayers(targetComp);
        processedComps++;
        var audioLayerCount = countAudioLayers(targetComp);
        if (audioLayerCount > 0) {
          var addedLayers = insertTextForAllAudioLayers(targetComp, 960, 1040);
          textLayersAdded += addedLayers;
        }
        applyAnimationsToAllItems(targetComp);
      }
    }
    var resultMessage =
      "処理が完了しました。\n\n" +
      "処理されたコンポジション数: " +
      processedComps +
      "\n" +
      "追加されたテキストレイヤー数: " +
      textLayersAdded;
    if (fileNotFound.length > 0 || compNotFound.length > 0) {
      resultMessage += "\n\nエラーが発生しました:\n";
      if (fileNotFound.length > 0) {
        resultMessage +=
          "見つからないファイル: " + fileNotFound.join(", ") + "\n";
      }
      if (compNotFound.length > 0) {
        resultMessage +=
          "見つからないコンポジション: " + compNotFound.join(", ");
      }
    }
    customAlert(resultMessage, "処理完了");
  } catch (e) {
    Logger.error("処理エラー: " + e.toString());
    customAlert("処理中にエラーが発生しました: " + e.toString(), "エラー");
  }
}

function countAudioLayers(comp) {
  return comp.layers.filter((layer) => layer.hasAudio).length;
}
