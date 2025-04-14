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

      // ファイルをプロジェクトにインポート
      var importOptions = new ImportOptions(file);
      var audioItem = app.project.importFile(importOptions);

      // audioフォルダに移動
      audioItem.parentFolder = audioFolder;

      audioFiles.push({
        item: audioItem,
        name: file.name,
        size: file.length,
      });

      logger.log("オーディオファイルをプロジェクトに追加: " + file.name);
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

// オーディオファイルをメインコンポジションに追加する関数
function addAudioFilesToComp(comp) {
  var logger = new Logger("AudioHandler");

  if (audioFiles.length === 0) {
    logger.log("追加するオーディオファイルがありません");
    return false;
  }

  try {
    logger.log(
      audioFiles.length + "個のオーディオファイルをコンポジションに追加します"
    );

    for (var i = 0; i < audioFiles.length; i++) {
      // メインコンポジションにレイヤーとして追加
      var audioLayer = comp.layers.add(audioFiles[i].item);
      logger.log(
        "オーディオファイルをコンポジションに追加: " + audioFiles[i].name
      );
    }

    logger.log("すべてのオーディオファイルをコンポジションに追加しました");
    return true;
  } catch (e) {
    logger.log(
      "オーディオファイル追加中にエラーが発生しました: " + e.toString()
    );
    return false;
  }
}

// オーディオファイルの数を取得する関数
function getAudioFilesCount() {
  return audioFiles.length;
}
