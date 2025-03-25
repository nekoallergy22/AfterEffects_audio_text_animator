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

  // デバッグ: JSONデータの内容を表示
  alert(
    "コンポジション数: " +
      compData.length +
      "\nオーディオファイル数: " +
      audioData.length
  );

  // 数値でソートするヘルパー関数
  function numericSort(a, b, prop) {
    var aNum = parseInt(a[prop]);
    var bNum = parseInt(b[prop]);
    return aNum - bNum; // 昇順ソート
  }

  // コンポジションデータを数値順にソート (comp_idで昇順)
  compData.sort(function (a, b) {
    return numericSort(a, b, "comp_id");
  });

  // オーディオデータをcomp_idで昇順ソート
  audioData.sort(function (a, b) {
    return numericSort(a, b, "comp_id");
  });

  // デバッグ: ソート後のコンポジションIDを表示
  var compIds = compData
    .map(function (comp) {
      return comp.comp_id;
    })
    .join(", ");
  alert("ソート後のコンポジションID: " + compIds);

  // オーディオファイルをコンポジションに配置
  var audioPlacedCount = 0;
  for (var i = 0; i < audioData.length; i++) {
    var audioName = audioData[i].name.substring(0, 4);
    var compId = audioData[i].comp_id.toString();
    var audioFile = findFileInProject(audioName);
    var targetComp = findCompByName(compId);

    if (audioFile && targetComp) {
      placeFileInComp(audioFile, targetComp);
      audioPlacedCount++;
    } else {
      if (!audioFile) {
        fileNotFound.push(audioName);
      }
      if (!targetComp) {
        compNotFound.push(compId);
      }
    }
  }

  alert("配置されたオーディオファイル数: " + audioPlacedCount);

  // 各コンポジションを処理
  var numCompData = compData.length;
  var processedComps = 0;
  var textLayersAdded = 0;

  for (var i = 0; i < numCompData; i++) {
    // 重要な修正: nameではなくcomp_idを使用
    var compId = compData[i].comp_id.toString();
    var targetComp = findCompByName(compId);

    if (targetComp) {
      processedComps++;

      // デバッグ: 処理中のコンポジション情報
      var audioLayerCount = countAudioLayers(targetComp);
      alert(
        "処理中: [ " +
          targetComp.name +
          " ] (" +
          (i + 1) +
          "/" +
          numCompData +
          ") - オーディオレイヤー数: " +
          audioLayerCount
      );

      try {
        // オーディオレイヤーをシーケンス状に配置
        sequenceAudioLayers(targetComp);

        // テキストを配置
        var addedLayers = insertTextForAllAudioLayers(targetComp, 960, 1040);
        textLayersAdded += addedLayers;

        // アイテムにアニメーションを適用
        applyAnimationsToAllItems(targetComp);
      } catch (e) {
        alert("エラー発生 (コンポ " + compId + "): " + e.toString());
      }
    }
  }

  alert(
    "処理されたコンポジション数: " +
      processedComps +
      "\n追加されたテキストレイヤー数: " +
      textLayersAdded
  );

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

/**
 * コンポジション内のオーディオレイヤー数をカウントする関数
 * @param {CompItem} comp - 対象のコンポジション
 * @return {number} オーディオレイヤーの数
 */
function countAudioLayers(comp) {
  var count = 0;
  for (var i = 1; i <= comp.numLayers; i++) {
    if (comp.layer(i).hasAudio) {
      count++;
    }
  }
  return count;
}
