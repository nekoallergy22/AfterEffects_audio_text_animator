/**
 * After Effects Audio Text Animator - JSON Processing Functions
 * JSON処理関連の機能を提供します
 */

/**
 * JSONデータに基づいてコンポジションの長さを設定する関数
 */
function processJSONForCompDuration() {
  var jsonContent = openJsonContents();
  if (!jsonContent) return;

  var data = JSON.parse(jsonContent);
  var projData = data.project;
  var compData = data.comp;
  var compNotFound = [];

  // メインコンポジションの合計時間を計算
  var mainDuration = 0;
  for (var i = 0; i < compData.length; i++) {
    var compDuration = compData[i].duration / 1000; // ミリ秒から秒に変換
    mainDuration += compDuration;
  }

  // メインコンポジションを検索または作成
  var mainCompName = projData.name;
  var mainComp = findCompByName(mainCompName);

  if (mainComp === null) {
    // メインコンポジションが存在しない場合は新規作成
    var compWidth = 1920;
    var compHeight = 1080;
    var compPixelAspect = 1;
    var compFrameRate = 24;

    mainComp = createNewComp(
      mainCompName,
      compWidth,
      compHeight,
      compPixelAspect,
      mainDuration,
      compFrameRate
    );
  }

  // コンポジションデータを名前順にソート
  compData.sort(function (a, b) {
    return b.name.localeCompare(a.name);
  });

  // 各コンポジションの長さを設定し、メインコンポジションに配置
  for (var i = 0; i < compData.length; i++) {
    var compId = compData[i].comp_id.toString();
    var compDuration = compData[i].duration / 1000; // ミリ秒から秒に変換
    var comp = findCompByName(compId);

    if (comp) {
      comp.duration = compDuration;
      placeFileInComp(comp, mainComp);
    } else {
      compNotFound.push(compId);
    }
  }

  // コンポジションをシーケンス状に配置
  sequenceCompLayers(mainComp);

  // 結果を表示
  if (compNotFound.length > 0) {
    alert(
      "The following compositions were not found: " + compNotFound.join(", ")
    );
  } else {
    alert("Comp Durations successfully updated for all listed comps.");
  }
}

/**
 * JSONデータに基づいてオーディオファイルをコンポジションに配置する関数
 */
function processJSONForAudioImport() {
  alert("オーディオインポート処理を開始します...");

  var jsonContent = openJsonContents();
  if (!jsonContent) return;

  var data = JSON.parse(jsonContent);
  var audioData = data.audio;
  var compData = data.comp;
  var fileNotFound = [];
  var compNotFound = [];

  // コンポジションデータを名前順にソート
  compData.sort(function (a, b) {
    return b.name.localeCompare(a.name);
  });

  // オーディオデータを名前順にソート
  audioData.sort(function (a, b) {
    return b.name.localeCompare(a.name);
  });

  // オーディオファイルをコンポジションに配置
  for (var i = 0; i < audioData.length; i++) {
    var audioName = audioData[i].name.substring(0, 4);
    var compId = audioData[i].comp_id.toString();
    var audioFile = findFileInProject(audioName);
    var targetComp = findCompByName(compId);

    if (audioFile && targetComp) {
      placeFileInComp(audioFile, targetComp);
    } else {
      if (!audioFile) {
        fileNotFound.push(audioName);
      }
      if (!targetComp) {
        compNotFound.push(compId);
      }
    }
  }

  // 各コンポジションを処理
  var numCompData = compData.length;
  for (var i = 0; i < numCompData; i++) {
    var compId = compData[i].name;
    var targetComp = findCompByName(compId);

    if (targetComp) {
      alert(
        "処理中: [ " +
          targetComp.name +
          " ] 完了! (" +
          (i + 1) +
          "/" +
          numCompData +
          ")"
      );

      // オーディオレイヤーをシーケンス状に配置
      sequenceAudioLayers(targetComp);

      // アイテムにアニメーションを適用
      applyAnimationsToAllItems(targetComp);

      // テキストを配置
      insertTextForAllAudioLayers(targetComp, 960, 1040);
    }
  }

  // 結果を表示
  if (fileNotFound.length > 0 || compNotFound.length > 0) {
    alert(
      "エラーが発生しました:\n" +
        "見つからないファイル: " +
        fileNotFound.join(", ") +
        "\n" +
        "見つからないコンポジション: " +
        compNotFound.join(", ")
    );
  } else {
    alert("オーディオファイルが正常にインポートされました。");
  }
}
