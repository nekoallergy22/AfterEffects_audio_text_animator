// audioHandler.jsx - オーディオファイルの読み込みと管理を担当するモジュール
var audioFiles = []; // オーディオファイルを格納する配列

function loadAudioFiles(panel) {
  var logger = new Logger("AudioHandler");

  try {
    // 複数ファイル選択ダイアログを表示
    var audioFilesSelection = File.openDialog(
      "オーディオファイルを選択",
      "オーディオファイル:*.wav,*.mp3,*.aif,*.aiff,*.m4a;すべてのファイル:*.*",
      true
    ); // trueで複数選択可能

    if (!audioFilesSelection) {
      logger.log("オーディオファイル選択がキャンセルされました");
      return;
    }

    // audioフォルダを作成または取得
    var audioFolder = findOrCreateFolder("audio");

    // 選択されたファイルをプロジェクトに追加
    for (var i = 0; i < audioFilesSelection.length; i++) {
      var file = audioFilesSelection[i];

      // ファイル名をURLデコードして正しい形式に変換
      var decodedName = decodeURIComponent(file.name);

      // ファイルをプロジェクトにインポート
      var importOptions = new ImportOptions(file);
      var audioItem = app.project.importFile(importOptions);

      // audioフォルダに移動
      audioItem.parentFolder = audioFolder;

      audioFiles.push({
        item: audioItem,
        name: decodedName, // URLデコード済みの名前を保存
        id: parseInt(decodedName.substring(0, 4)), // ファイル名の先頭4桁をIDとして扱う
        size: file.length,
      });

      logger.log("オーディオファイルをプロジェクトに追加: " + decodedName);
    }

    // UI表示を更新
    updateAudioFilesInfo(panel);

    alert(
      audioFilesSelection.length +
        "個のオーディオファイルをプロジェクトに追加しました"
    );
  } catch (e) {
    logger.log(
      "オーディオファイル読み込み中にエラーが発生しました: " + e.toString()
    );
    alert(
      "オーディオファイル読み込み中にエラーが発生しました: " + e.toString()
    );
  }
}

function updateAudioFilesInfo(panel) {
  updateSectionInfo(panel);

  // 選択したオーディオファイルの情報をresultTextに追加
  if (audioFiles.length > 0) {
    var audioInfo = "選択したオーディオファイル:\n";
    for (var i = 0; i < audioFiles.length; i++) {
      audioInfo += i + 1 + ". " + audioFiles[i].name + "\n";
    }

    // 既存のJSON情報があれば保持
    if (jsonData) {
      // 既存のオーディオ情報を削除して新しい情報を追加
      var jsonText =
        panel.resultText.text.split("選択したオーディオファイル:")[0];
      panel.resultText.text = jsonText + "\n\n" + audioInfo;
    } else {
      panel.resultText.text = audioInfo;
    }
  }
}

// サブコンポジションに対応するオーディオを配置する関数
function addAudioToSubComps(slideComps, jsonSlides) {
  var logger = new Logger("AudioHandler");

  try {
    for (var i = 0; i < jsonSlides.length; i++) {
      var slideData = jsonSlides[i];
      var slideComp = slideComps[i];

      if (!slideData.audio_list || slideData.audio_list.length === 0) {
        logger.log(
          "スライド " + slideData.name + " に対応するオーディオがありません"
        );
        continue;
      }

      for (var j = 0; j < slideData.audio_list.length; j++) {
        var audioId = slideData.audio_list[j];
        var audioFile = findAudioById(audioId);

        if (!audioFile) {
          logger.log(
            "スライド " +
              slideData.name +
              " に対応するID " +
              audioId +
              " のオーディオが見つかりませんでした"
          );
          continue;
        }

        // サブコンポジションにレイヤーとして追加
        var layer = slideComp.layers.add(audioFile.item);
        layer.startTime = calculateStartTime(
          slideComp,
          layer,
          j,
          slideData.margin || 0
        );

        logger.log(
          "スライド " +
            slideData.name +
            " にオーディオ " +
            audioFile.name +
            " を追加しました"
        );
      }
    }

    return true;
  } catch (e) {
    logger.log(
      "サブコンポジションへのオーディオ配置中にエラーが発生しました: " +
        e.toString()
    );
    return false;
  }
}

// IDで対応する音声データを見つける関数
function findAudioById(id) {
  for (var i = 0; i < audioFiles.length; i++) {
    if (audioFiles[i].id === id) {
      return audioFiles[i];
    }
  }
  return null;
}

// オーディオレイヤーの開始時間を計算する関数
function calculateStartTime(comp, layer, index, margin) {
  if (index === 0) return margin / 1000; // 最初のレイヤーはマージンのみ考慮

  var previousLayer = comp.layer(comp.numLayers - index); // 前のレイヤー取得
  return previousLayer.outPoint + margin / 1000;
}
