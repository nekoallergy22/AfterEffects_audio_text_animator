/**
 * After Effects Audio Text Animator - JSON Processing Functions
 * JSON処理関連の機能を提供します
 */

/**
 * JSONデータに基づいてコンポジションの長さを設定する関数
 */
function processJSONForCompDuration() {
  // 処理中断フラグをリセット
  resetCancellationFlag();

  // 処理開始メッセージ
  customAlert("コンポジション長設定処理を開始します...");

  var jsonContent = openJsonContents();
  if (!jsonContent) return;

  try {
    var data = JSON.parse(jsonContent);
    var projData = data.project;
    var compData = data.comp;
    var compNotFound = [];

    // JSONデータの内容を表示
    if (
      !customAlert(
        "プロジェクト名: " +
          projData.name +
          "\n" +
          "コンポジション数: " +
          compData.length,
        "JSONデータ情報",
        true // 中断ボタンを表示
      )
    ) {
      Logger.info("ユーザーによって処理が中断されました");
      return;
    }

    // メインコンポジションの合計時間を計算
    var mainDuration = 0;
    for (var i = 0; i < compData.length; i++) {
      var compDuration = compData[i].duration / 1000; // ミリ秒から秒に変換
      mainDuration += compDuration;
    }

    Logger.info("メインコンポジション合計時間: " + mainDuration + "秒");

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
      Logger.info("メインコンポジション作成: " + mainCompName);
    } else {
      Logger.info("既存のメインコンポジションを使用: " + mainCompName);
    }

    if (isProcessingCancelled()) return;

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

    Logger.info("コンポジションデータをソート完了");

    if (
      !customAlert(
        "各コンポジションの長さを設定し、メインコンポジションに配置します。\n" +
          "処理するコンポジション数: " +
          compData.length,
        "処理続行の確認",
        true // 中断ボタンを表示
      )
    ) {
      Logger.info("ユーザーによって処理が中断されました");
      return;
    }

    // 各コンポジションの長さを設定し、メインコンポジションに配置
    var processedComps = 0;
    for (var i = 0; i < compData.length; i++) {
      if (isProcessingCancelled()) return;

      // 5件ごとに進捗を表示し、中断の機会を与える
      if (i > 0 && i % 5 === 0) {
        if (
          !customAlert(
            "コンポジション処理中: " + i + "/" + compData.length,
            "処理中...",
            true // 中断ボタンを表示
          )
        ) {
          Logger.info("ユーザーによって処理が中断されました");
          return;
        }
      }

      var compId = compData[i].comp_id.toString();
      var compDuration = compData[i].duration / 1000; // ミリ秒から秒に変換
      var comp = findCompByName(compId);

      if (comp) {
        comp.duration = compDuration;
        placeFileInComp(comp, mainComp);
        processedComps++;
        Logger.info(
          "コンポジション処理: ID=" + compId + ", 長さ=" + compDuration + "秒"
        );
      } else {
        compNotFound.push(compId);
        Logger.warn("コンポジションが見つかりません: " + compId);
      }
    }

    if (isProcessingCancelled()) return;

    // コンポジションをシーケンス状に配置
    Logger.info("コンポジションをシーケンス配置開始");
    sequenceCompLayers(mainComp);
    Logger.info("コンポジションをシーケンス配置完了");

    // 結果を表示
    var resultMessage = "";
    if (compNotFound.length > 0) {
      resultMessage =
        "以下のコンポジションが見つかりませんでした: " +
        compNotFound.join(", ");
      Logger.warn(resultMessage);
    } else {
      resultMessage =
        "すべてのコンポジション長さを更新しました。処理数: " + processedComps;
      Logger.info(resultMessage);
    }

    customAlert(resultMessage, "処理完了");
  } catch (e) {
    Logger.error("コンポジション長設定エラー: " + e.toString());
    customAlert("エラーが発生しました: " + e.toString(), "エラー");
  }
}

/**
 * JSONデータに基づいてオーディオファイルをコンポジションに配置する関数
 */
function processJSONForAudioImport() {
  // 処理中断フラグをリセット
  resetCancellationFlag();

  // 処理開始メッセージ
  customAlert("オーディオインポート処理を開始します...");

  var jsonContent = openJsonContents();
  if (!jsonContent) return;

  try {
    var data = JSON.parse(jsonContent);
    var audioData = data.audio;
    var compData = data.comp;
    var fileNotFound = [];
    var compNotFound = [];

    // デバッグ: JSONデータの内容を表示
    if (
      !customAlert(
        "コンポジション数: " +
          compData.length +
          "\nオーディオファイル数: " +
          audioData.length,
        "JSONデータ情報",
        true // 中断ボタンを表示
      )
    ) {
      Logger.info("ユーザーによって処理が中断されました");
      return; // ユーザーが中断を選択した場合
    }

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

    Logger.info("データをソート完了");

    // デバッグ: ソート後のコンポジションIDを表示
    var compIds = compData
      .map(function (comp) {
        return comp.comp_id;
      })
      .join(", ");

    if (isProcessingCancelled()) return;

    // コンポジションごとにオーディオファイルをグループ化
    var compAudioMap = {};

    // 各コンポジションに配置するオーディオファイルをグループ化
    for (var i = 0; i < audioData.length; i++) {
      var audioItem = audioData[i];
      var compId = audioItem.comp_id.toString();
      var audioId = audioItem.audio_id;

      // audio_idが正しく読み込めているか確認
      if (audioId === undefined || audioId === null) {
        Logger.error("audio_idが見つかりません: " + audioItem.name);
        continue;
      }

      if (!compAudioMap[compId]) {
        compAudioMap[compId] = [];
      }

      // デバッグ情報
      Logger.info(
        "オーディオアイテム解析: " +
          audioItem.name +
          " (audio_id: " +
          audioId +
          ", comp_id: " +
          compId +
          ")"
      );

      compAudioMap[compId].push(audioItem);
    }

    // 各コンポジションに対して処理
    var audioPlacedCount = 0;
    var compIds = Object.keys(compAudioMap);

    for (var i = 0; i < compIds.length; i++) {
      // 10件ごとに進捗を表示し、中断の機会を与える
      if (i > 0 && i % 10 === 0) {
        if (
          !customAlert(
            "オーディオファイル配置中: コンポジション " +
              (i + 1) +
              "/" +
              compIds.length,
            "処理中...",
            true // 中断ボタンを表示
          )
        ) {
          Logger.info("ユーザーによって処理が中断されました");
          return; // ユーザーが中断を選択した場合
        }
      }

      if (isProcessingCancelled()) return;

      var compId = compIds[i];
      var targetComp = findCompByName(compId);

      if (!targetComp) {
        compNotFound.push(compId);
        Logger.warn("コンポジションが見つかりません: " + compId);
        continue;
      }

      // このコンポジションに配置するオーディオファイル
      var compAudioFiles = compAudioMap[compId];

      // audio_idで昇順ソート
      compAudioFiles.sort(function (a, b) {
        // audio_idを使用
        var aId = a.audio_id;
        var bId = b.audio_id;

        // デバッグ情報
        Logger.info(
          "ソート比較: " +
            a.name +
            " (audio_id: " +
            aId +
            ") vs " +
            b.name +
            " (audio_id: " +
            bId +
            ")"
        );

        // 昇順ソート
        return aId - bId;
      });

      // ソート結果を詳細にログ出力
      Logger.info("コンポジション " + compId + " のソート結果:");
      for (var j = 0; j < compAudioFiles.length; j++) {
        Logger.info(
          j +
            1 +
            ". " +
            compAudioFiles[j].name +
            " (audio_id: " +
            compAudioFiles[j].audio_id +
            ")"
        );
      }

      // ソート結果をログに出力
      var sortedNames = "";
      for (var j = 0; j < compAudioFiles.length; j++) {
        if (j > 0) sortedNames += ", ";
        sortedNames += compAudioFiles[j].name;
      }
      Logger.info("ソート結果: " + sortedNames);

      // まず、既存のオーディオレイヤーをすべて削除
      for (var j = targetComp.numLayers; j >= 1; j--) {
        var layer = targetComp.layer(j);
        if (layer.hasAudio && layer.source instanceof FootageItem) {
          layer.remove();
        }
      }

      // ソートされた順序でオーディオファイルを配置
      // 配置前のログ
      Logger.info("配置前のレイヤー状態:");
      for (var j = 1; j <= targetComp.numLayers; j++) {
        Logger.info("レイヤー " + j + ": " + targetComp.layer(j).name);
      }

      // 昇順でオーディオファイルを配置
      for (var j = 0; j < compAudioFiles.length; j++) {
        var audioItem = compAudioFiles[j];
        // ファイル名全体を使用
        var audioName = audioItem.name;
        var audioFile = findFileInProject(audioName);

        if (audioFile) {
          // レイヤーを追加（インデックスを明示的に指定）
          // After Effectsでは、インデックスが小さいほど上のレイヤー
          // j+1を指定することで、audio_idが小さいほど上のレイヤーになる
          var layer = targetComp.layers.add(audioFile, j + 1);
          audioPlacedCount++;
          Logger.info(
            "オーディオ配置: " +
              audioItem.name +
              " → コンポジション " +
              compId +
              " (audio_id: " +
              audioItem.audio_id +
              ", インデックス: " +
              layer.index +
              ")"
          );
        } else {
          fileNotFound.push(audioName);
          Logger.warn("オーディオファイルが見つかりません: " + audioName);
        }
      }

      // 配置後のログ
      Logger.info("配置後のレイヤー状態:");
      for (var j = 1; j <= targetComp.numLayers; j++) {
        Logger.info("レイヤー " + j + ": " + targetComp.layer(j).name);
      }
    }

    if (isProcessingCancelled()) return;

    customAlert("配置されたオーディオファイル数: " + audioPlacedCount);
    Logger.info("オーディオファイル配置完了: " + audioPlacedCount + "件");
  } catch (e) {
    Logger.error("JSONデータ処理エラー: " + e.toString());
    customAlert("エラーが発生しました: " + e.toString(), "エラー");
    return;
  }

  // 各コンポジションを処理
  try {
    var numCompData = compData.length;
    var processedComps = 0;
    var textLayersAdded = 0;

    // 処理を続行するか確認
    if (
      !customAlert(
        "オーディオシーケンス配置とテキスト挿入を開始します。\n" +
          "処理するコンポジション数: " +
          numCompData,
        "処理続行の確認",
        true // 中断ボタンを表示
      )
    ) {
      Logger.info("ユーザーによって処理が中断されました");
      return;
    }

    // オーディオシーケンス配置
    Logger.info("オーディオシーケンス配置開始");
    for (var i = 0; i < numCompData; i++) {
      if (isProcessingCancelled()) return;

      // 4件ごとに進捗を表示し、中断の機会を与える
      if (i > 0 && i % 4 === 0) {
        if (
          !customAlert(
            "オーディオシーケンス配置中: " + i + "/" + numCompData,
            "処理中...",
            true // 中断ボタンを表示
          )
        ) {
          Logger.info("ユーザーによって処理が中断されました");
          return;
        }
      }

      var compId = compData[i].comp_id.toString();
      var targetComp = findCompByName(compId);

      if (targetComp) {
        // オーディオレイヤーをシーケンス状に配置
        sequenceAudioLayers(targetComp);
        Logger.info("オーディオシーケンス配置: コンポジション " + compId);
      }
    }

    if (isProcessingCancelled()) return;

    // 処理を続行するか確認
    if (
      !customAlert(
        "オーディオシーケンス配置が完了しました。\nテキスト挿入を開始します。",
        "処理続行の確認",
        true // 中断ボタンを表示
      )
    ) {
      Logger.info("ユーザーによって処理が中断されました");
      return;
    }

    // テキスト挿入
    Logger.info("テキスト挿入開始");
    for (var i = 0; i < numCompData; i++) {
      if (isProcessingCancelled()) return;

      // 重要な修正: nameではなくcomp_idを使用
      var compId = compData[i].comp_id.toString();
      var targetComp = findCompByName(compId);

      if (targetComp) {
        processedComps++;

        // デバッグ: 処理中のコンポジション情報
        var audioLayerCount = countAudioLayers(targetComp);
        Logger.info(
          "テキスト挿入: コンポジション " +
            compId +
            " (オーディオレイヤー数: " +
            audioLayerCount +
            ")"
        );

        // 進捗を表示し、中断の機会を与える
        if (
          !customAlert(
            "テキスト挿入中: [ " +
              targetComp.name +
              " ] (" +
              (i + 1) +
              "/" +
              numCompData +
              ")\n" +
              "オーディオレイヤー数: " +
              audioLayerCount,
            "処理中...",
            true // 中断ボタンを表示
          )
        ) {
          Logger.info("ユーザーによって処理が中断されました");
          return;
        }

        try {
          if (audioLayerCount > 0) {
            // テキストを配置
            var addedLayers = insertTextForAllAudioLayers(
              targetComp,
              960,
              1040
            );
            textLayersAdded += addedLayers;
            Logger.info(
              "テキスト挿入完了: コンポジション " +
                compId +
                " (追加されたテキストレイヤー数: " +
                addedLayers +
                ")"
            );
          } else {
            Logger.warn(
              "コンポジション " + compId + " にはオーディオレイヤーがありません"
            );
          }
        } catch (e) {
          Logger.error(
            "テキスト挿入エラー (コンポ " + compId + "): " + e.toString()
          );
          customAlert(
            "エラー発生 (コンポ " + compId + "): " + e.toString(),
            "エラー"
          );
        }
      }
    }

    if (isProcessingCancelled()) return;

    // 処理を続行するか確認
    if (
      !customAlert(
        "テキスト挿入が完了しました。\nアニメーション適用を開始します。",
        "処理続行の確認",
        true // 中断ボタンを表示
      )
    ) {
      Logger.info("ユーザーによって処理が中断されました");
      return;
    }

    // アニメーション適用
    Logger.info("アニメーション適用開始");
    for (var i = 0; i < numCompData; i++) {
      if (isProcessingCancelled()) return;

      // 4件ごとに進捗を表示し、中断の機会を与える
      if (i > 0 && i % 4 === 0) {
        if (
          !customAlert(
            "アニメーション適用中: " + i + "/" + numCompData,
            "処理中...",
            true // 中断ボタンを表示
          )
        ) {
          Logger.info("ユーザーによって処理が中断されました");
          return;
        }
      }

      var compId = compData[i].comp_id.toString();
      var targetComp = findCompByName(compId);

      if (targetComp) {
        try {
          // アイテムにアニメーションを適用
          applyAnimationsToAllItems(targetComp);
          Logger.info("アニメーション適用: コンポジション " + compId);
        } catch (e) {
          Logger.error(
            "アニメーション適用エラー (コンポ " + compId + "): " + e.toString()
          );
          customAlert(
            "エラー発生 (コンポ " + compId + "): " + e.toString(),
            "エラー"
          );
        }
      }
    }

    // 最終結果を表示
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

    Logger.info(
      "処理完了: コンポジション数=" +
        processedComps +
        ", テキストレイヤー数=" +
        textLayersAdded
    );
    customAlert(resultMessage, "処理完了");
  } catch (e) {
    Logger.error("処理エラー: " + e.toString());
    customAlert("処理中にエラーが発生しました: " + e.toString(), "エラー");
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
