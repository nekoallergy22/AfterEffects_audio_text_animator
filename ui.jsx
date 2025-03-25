/**
 * After Effects Audio Text Animator - Main UI
 * ユーザーインターフェースとメイン処理を提供します
 */

// 必要なモジュールを読み込み
var scriptFolder = new File($.fileName).parent.absoluteURI;
$.evalFile(scriptFolder + "/utils.jsx");
$.evalFile(scriptFolder + "/animations.jsx");
$.evalFile(scriptFolder + "/textHandlers.jsx");
$.evalFile(scriptFolder + "/jsonHandlers.jsx");
$.evalFile(scriptFolder + "/logger.jsx");

// グローバル変数
var jsonData = null;
var mainComp = null;

// ScriptUI Panels用のエントリーポイント
function buildUI(thisObj) {
  // ロガーを初期化
  Logger.init();
  Logger.info("UIの構築を開始");

  var panel =
    thisObj instanceof Panel
      ? thisObj
      : new Window("palette", "After Effects Audio Text Animator", undefined, {
          resizeable: true,
        });

  // パネルのサイズを設定
  panel.preferredSize = [350, 400];

  // タブパネルを作成
  var tpanel = panel.add("tabbedpanel", undefined, "モード");
  tpanel.alignChildren = "fill";

  // 標準モードタブ
  var standardTab = tpanel.add("tab", undefined, "標準モード");
  standardTab.alignChildren = "fill";

  // 標準モードの説明
  var standardInfo = standardTab.add(
    "statictext",
    undefined,
    "標準モードでは、すべての処理を一度に実行します。\n処理中はESCキーで中断できます。",
    { multiline: true }
  );
  standardInfo.alignment = ["fill", "top"];
  standardInfo.preferredSize.height = 40;

  // 統合された処理ボタン
  var buttonProcessAll = standardTab.add(
    "button",
    undefined,
    "すべての処理を実行"
  );
  buttonProcessAll.size = [330, 40];
  buttonProcessAll.onClick = function () {
    try {
      // 処理中断フラグをリセット
      resetCancellationFlag();

      // ESCキーで中断できることを通知
      notifyEscToCancel();

      // ログ初期化
      Logger.info("標準モードですべての処理を開始");

      // 1. コンポジション長設定
      Logger.info("1. コンポジション長設定を開始");
      var jsonContent = openJsonContents();
      if (!jsonContent) return;

      try {
        var data = JSON.parse(jsonContent);
        var projData = data.project;
        var compData = data.comp;

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
          Logger.info("メインコンポジション作成: " + mainCompName);
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

        // 各コンポジションの長さを設定し、メインコンポジションに配置
        var processedComps = 0;
        var compNotFound = [];

        for (var i = 0; i < compData.length; i++) {
          if (isProcessingCancelled()) return;

          var compId = compData[i].comp_id.toString();
          var compDuration = compData[i].duration / 1000; // ミリ秒から秒に変換
          var comp = findCompByName(compId);

          if (comp) {
            comp.duration = compDuration;
            placeFileInComp(comp, mainComp);
            processedComps++;
            Logger.info(
              "コンポジション処理: ID=" +
                compId +
                ", 長さ=" +
                compDuration +
                "秒"
            );
          } else {
            compNotFound.push(compId);
            Logger.warn("コンポジションが見つかりません: " + compId);
          }
        }

        // コンポジションをシーケンス状に配置
        sequenceCompLayers(mainComp);
        Logger.info("コンポジションをシーケンス配置完了");

        // エラーがあれば表示
        if (compNotFound.length > 0) {
          var errorMessage =
            "以下のコンポジションが見つかりませんでした: " +
            compNotFound.join(", ");
          Logger.warn(errorMessage);
          customAlert(errorMessage, "エラー");
        }

        Logger.info("1. コンポジション長設定が完了しました");

        // 2. オーディオインポート
        if (isProcessingCancelled()) return;

        Logger.info("2. オーディオインポート処理を開始");

        var audioData = data.audio;
        var fileNotFound = [];

        // オーディオデータをcomp_idで昇順ソート
        audioData.sort(function (a, b) {
          return numericSort(a, b, "comp_id");
        });

        // オーディオファイルをコンポジションに配置
        var audioPlacedCount = 0;

        for (var i = 0; i < audioData.length; i++) {
          if (isProcessingCancelled()) return;

          var audioName = audioData[i].name.substring(0, 4);
          var compId = audioData[i].comp_id.toString();
          var audioFile = findFileInProject(audioName);
          var targetComp = findCompByName(compId);

          if (audioFile && targetComp) {
            placeFileInComp(audioFile, targetComp);
            audioPlacedCount++;
            Logger.info(
              "オーディオ配置: " + audioName + " → コンポジション " + compId
            );
          } else {
            if (!audioFile) {
              fileNotFound.push(audioName);
              Logger.warn("オーディオファイルが見つかりません: " + audioName);
            }
            if (!targetComp) {
              compNotFound.push(compId);
              Logger.warn("コンポジションが見つかりません: " + compId);
            }
          }
        }

        Logger.info("オーディオファイル配置完了: " + audioPlacedCount + "件");

        // 3. オーディオシーケンス配置
        if (isProcessingCancelled()) return;

        Logger.info("3. オーディオシーケンス配置開始");

        var numCompData = compData.length;
        var processedComps = 0;
        var textLayersAdded = 0;

        for (var i = 0; i < numCompData; i++) {
          if (isProcessingCancelled()) return;

          var compId = compData[i].comp_id.toString();
          var targetComp = findCompByName(compId);

          if (targetComp) {
            // オーディオレイヤーをシーケンス状に配置
            sequenceAudioLayers(targetComp);
            Logger.info("オーディオシーケンス配置: コンポジション " + compId);
          }
        }

        // 4. テキスト挿入
        if (isProcessingCancelled()) return;

        Logger.info("4. テキスト挿入開始");

        for (var i = 0; i < numCompData; i++) {
          if (isProcessingCancelled()) return;

          var compId = compData[i].comp_id.toString();
          var targetComp = findCompByName(compId);

          if (targetComp) {
            processedComps++;

            var audioLayerCount = countAudioLayers(targetComp);
            Logger.info(
              "テキスト挿入: コンポジション " +
                compId +
                " (オーディオレイヤー数: " +
                audioLayerCount +
                ")"
            );

            if (audioLayerCount > 0) {
              // テキストを配置（アラート表示なし）
              var addedLayers = insertTextForAllAudioLayers(
                targetComp,
                960,
                1040,
                false
              );
              textLayersAdded += addedLayers;
              Logger.info(
                "テキスト挿入完了: コンポジション " +
                  compId +
                  " (追加されたテキストレイヤー数: " +
                  addedLayers +
                  ")"
              );
            }
          }
        }

        // 5. アニメーション適用
        if (isProcessingCancelled()) return;

        Logger.info("5. アニメーション適用開始");

        for (var i = 0; i < numCompData; i++) {
          if (isProcessingCancelled()) return;

          var compId = compData[i].comp_id.toString();
          var targetComp = findCompByName(compId);

          if (targetComp) {
            try {
              // アイテムにアニメーションを適用（アラート表示なし）
              applyAnimationsToAllItems(targetComp, false);
              Logger.info("アニメーション適用: コンポジション " + compId);
            } catch (e) {
              Logger.error(
                "アニメーション適用エラー (コンポ " +
                  compId +
                  "): " +
                  e.toString()
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
          textLayersAdded +
          "\n" +
          "配置されたオーディオファイル数: " +
          audioPlacedCount;

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

        Logger.info("すべての処理が完了しました");
        customAlert(resultMessage, "処理完了");
      } catch (e) {
        Logger.error("処理エラー: " + e.toString());
        customAlert("処理中にエラーが発生しました: " + e.toString(), "エラー");
      }
    } catch (e) {
      Logger.error("処理エラー: " + e.toString());
      customAlert("処理中にエラーが発生しました: " + e.toString(), "エラー");
    }
  };

  // ステップバイステップモードタブ
  var stepTab = tpanel.add("tab", undefined, "ステップモード");
  stepTab.alignChildren = "fill";

  // ステップ1: JSONファイル読み込み
  var step1Group = stepTab.add(
    "panel",
    undefined,
    "ステップ1: JSONファイル読み込み"
  );
  step1Group.alignChildren = "fill";

  var buttonLoadJSON = step1Group.add(
    "button",
    undefined,
    "JSONファイル読み込み"
  );
  buttonLoadJSON.onClick = function () {
    try {
      Logger.info("JSONファイル読み込み開始");
      var jsonContent = openJsonContents();
      if (jsonContent) {
        jsonData = JSON.parse(jsonContent);
        Logger.info(
          "JSONファイル読み込み成功: コンポジション数=" +
            jsonData.comp.length +
            ", オーディオファイル数=" +
            jsonData.audio.length
        );
        alert(
          "JSONファイル読み込み成功\nコンポジション数: " +
            jsonData.comp.length +
            "\nオーディオファイル数: " +
            jsonData.audio.length
        );
      }
    } catch (e) {
      Logger.error("JSONファイル読み込みエラー: " + e.toString());
      alert("JSONファイル読み込みエラー: " + e.toString());
    }
  };

  // ステップ2: コンポジション長設定
  var step2Group = stepTab.add(
    "panel",
    undefined,
    "ステップ2: コンポジション長設定"
  );
  step2Group.alignChildren = "fill";

  var buttonSetupComps = step2Group.add(
    "button",
    undefined,
    "コンポジション長設定"
  );
  buttonSetupComps.onClick = function () {
    try {
      if (!jsonData) {
        alert("先にJSONファイルを読み込んでください");
        return;
      }

      Logger.info("コンポジション長設定開始");

      var projData = jsonData.project;
      var compData = jsonData.comp;
      var compNotFound = [];

      // メインコンポジションの合計時間を計算
      var mainDuration = 0;
      for (var i = 0; i < compData.length; i++) {
        var compDuration = compData[i].duration / 1000; // ミリ秒から秒に変換
        mainDuration += compDuration;
      }

      // メインコンポジションを検索または作成
      var mainCompName = projData.name;
      mainComp = findCompByName(mainCompName);

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

      Logger.info("コンポジションデータをソート完了");

      // 各コンポジションの長さを設定し、メインコンポジションに配置
      var processedComps = 0;
      for (var i = 0; i < compData.length; i++) {
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

      // コンポジションをシーケンス状に配置
      sequenceCompLayers(mainComp);
      Logger.info("コンポジションをシーケンス配置完了");

      // 結果を表示
      if (compNotFound.length > 0) {
        var message =
          "以下のコンポジションが見つかりませんでした: " +
          compNotFound.join(", ");
        Logger.warn(message);
        alert(message);
      } else {
        var message =
          "すべてのコンポジション長さを更新しました。処理数: " + processedComps;
        Logger.info(message);
        alert(message);
      }
    } catch (e) {
      Logger.error("コンポジション長設定エラー: " + e.toString());
      alert("コンポジション長設定エラー: " + e.toString());
    }
  };

  // ステップ3: オーディオ配置
  var step3Group = stepTab.add("panel", undefined, "ステップ3: オーディオ配置");
  step3Group.alignChildren = "fill";

  var buttonPlaceAudio = step3Group.add("button", undefined, "オーディオ配置");
  buttonPlaceAudio.onClick = function () {
    try {
      if (!jsonData) {
        alert("先にJSONファイルを読み込んでください");
        return;
      }

      Logger.info("オーディオ配置開始");

      var audioData = jsonData.audio;
      var compData = jsonData.comp;
      var fileNotFound = [];
      var compNotFound = [];

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
          Logger.info(
            "オーディオ配置: " + audioName + " → コンポジション " + compId
          );
        } else {
          if (!audioFile) {
            fileNotFound.push(audioName);
            Logger.warn("オーディオファイルが見つかりません: " + audioName);
          }
          if (!targetComp) {
            compNotFound.push(compId);
            Logger.warn("コンポジションが見つかりません: " + compId);
          }
        }
      }

      // 結果を表示
      var message =
        "オーディオ配置完了\n配置されたオーディオファイル数: " +
        audioPlacedCount;
      if (fileNotFound.length > 0 || compNotFound.length > 0) {
        message += "\n\nエラーが発生しました:\n";
        if (fileNotFound.length > 0) {
          message += "見つからないファイル: " + fileNotFound.join(", ") + "\n";
        }
        if (compNotFound.length > 0) {
          message += "見つからないコンポジション: " + compNotFound.join(", ");
        }
      }

      Logger.info(message);
      alert(message);
    } catch (e) {
      Logger.error("オーディオ配置エラー: " + e.toString());
      alert("オーディオ配置エラー: " + e.toString());
    }
  };

  // ステップ4: オーディオシーケンス配置
  var step4Group = stepTab.add(
    "panel",
    undefined,
    "ステップ4: オーディオシーケンス配置"
  );
  step4Group.alignChildren = "fill";

  var buttonSequenceAudio = step4Group.add(
    "button",
    undefined,
    "オーディオシーケンス配置"
  );
  buttonSequenceAudio.onClick = function () {
    try {
      if (!jsonData) {
        alert("先にJSONファイルを読み込んでください");
        return;
      }

      Logger.info("オーディオシーケンス配置開始");

      var compData = jsonData.comp;
      var processedComps = 0;

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

      // 各コンポジションを処理
      for (var i = 0; i < compData.length; i++) {
        var compId = compData[i].comp_id.toString();
        var targetComp = findCompByName(compId);

        if (targetComp) {
          // オーディオレイヤーをシーケンス状に配置
          sequenceAudioLayers(targetComp);
          processedComps++;
          Logger.info("オーディオシーケンス配置: コンポジション " + compId);
        }
      }

      // 結果を表示
      var message =
        "オーディオシーケンス配置完了\n処理されたコンポジション数: " +
        processedComps;
      Logger.info(message);
      alert(message);
    } catch (e) {
      Logger.error("オーディオシーケンス配置エラー: " + e.toString());
      alert("オーディオシーケンス配置エラー: " + e.toString());
    }
  };

  // ステップ5: テキスト挿入
  var step5Group = stepTab.add("panel", undefined, "ステップ5: テキスト挿入");
  step5Group.alignChildren = "fill";

  var buttonInsertText = step5Group.add("button", undefined, "テキスト挿入");
  buttonInsertText.onClick = function () {
    try {
      if (!jsonData) {
        alert("先にJSONファイルを読み込んでください");
        return;
      }

      Logger.info("テキスト挿入開始");

      var compData = jsonData.comp;
      var processedComps = 0;
      var totalTextLayers = 0;

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

      // 各コンポジションを処理
      for (var i = 0; i < compData.length; i++) {
        var compId = compData[i].comp_id.toString();
        var targetComp = findCompByName(compId);

        if (targetComp) {
          // テキストを配置
          var audioLayerCount = countAudioLayers(targetComp);
          Logger.info(
            "テキスト挿入: コンポジション " +
              compId +
              " (オーディオレイヤー数: " +
              audioLayerCount +
              ")"
          );

          if (audioLayerCount > 0) {
            var addedLayers = insertTextForAllAudioLayers(
              targetComp,
              960,
              1040
            );
            totalTextLayers += addedLayers;
            Logger.info(
              "テキスト挿入完了: コンポジション " +
                compId +
                " (追加されたテキストレイヤー数: " +
                addedLayers +
                ")"
            );
          }

          processedComps++;
        }
      }

      // 結果を表示
      var message =
        "テキスト挿入完了\n処理されたコンポジション数: " +
        processedComps +
        "\n追加されたテキストレイヤー数: " +
        totalTextLayers;
      Logger.info(message);
      alert(message);
    } catch (e) {
      Logger.error("テキスト挿入エラー: " + e.toString());
      alert("テキスト挿入エラー: " + e.toString());
    }
  };

  // ステップ6: アニメーション適用
  var step6Group = stepTab.add(
    "panel",
    undefined,
    "ステップ6: アニメーション適用"
  );
  step6Group.alignChildren = "fill";

  var buttonApplyAnimation = step6Group.add(
    "button",
    undefined,
    "アニメーション適用"
  );
  buttonApplyAnimation.onClick = function () {
    try {
      if (!jsonData) {
        alert("先にJSONファイルを読み込んでください");
        return;
      }

      Logger.info("アニメーション適用開始");

      var compData = jsonData.comp;
      var processedComps = 0;

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

      // 各コンポジションを処理
      for (var i = 0; i < compData.length; i++) {
        var compId = compData[i].comp_id.toString();
        var targetComp = findCompByName(compId);

        if (targetComp) {
          // アイテムにアニメーションを適用
          applyAnimationsToAllItems(targetComp);
          processedComps++;
          Logger.info("アニメーション適用: コンポジション " + compId);
        }
      }

      // 結果を表示
      var message =
        "アニメーション適用完了\n処理されたコンポジション数: " + processedComps;
      Logger.info(message);
      alert(message);
    } catch (e) {
      Logger.error("アニメーション適用エラー: " + e.toString());
      alert("アニメーション適用エラー: " + e.toString());
    }
  };

  // デバッグタブ
  var debugTab = tpanel.add("tab", undefined, "デバッグ");
  debugTab.alignChildren = "fill";

  // ログレベル設定
  var logLevelGroup = debugTab.add("panel", undefined, "ログレベル設定");
  logLevelGroup.alignChildren = "left";

  var logLevelDropdown = logLevelGroup.add("dropdownlist", undefined, [
    "エラーのみ",
    "警告とエラー",
    "情報、警告、エラー",
    "すべて（デバッグ含む）",
  ]);
  logLevelDropdown.selection = 1; // デフォルトは「警告とエラー」
  logLevelDropdown.onChange = function () {
    Logger.setLogLevel(this.selection.index);
    Logger.info("ログレベルを変更: " + this.selection.text);
  };

  // プロジェクト情報
  var projectInfoGroup = debugTab.add("panel", undefined, "プロジェクト情報");
  projectInfoGroup.alignChildren = "fill";

  var buttonShowProjectInfo = projectInfoGroup.add(
    "button",
    undefined,
    "プロジェクト情報表示"
  );
  buttonShowProjectInfo.onClick = function () {
    try {
      var project = app.project;
      var info = "プロジェクト名: " + project.file + "\n";
      info += "アイテム数: " + project.numItems + "\n\n";

      info += "コンポジション一覧:\n";
      var compCount = 0;

      for (var i = 1; i <= project.numItems; i++) {
        if (project.item(i) instanceof CompItem) {
          compCount++;
          var comp = project.item(i);
          info +=
            compCount +
            ". " +
            comp.name +
            " (" +
            comp.width +
            "x" +
            comp.height +
            ", " +
            comp.duration +
            "秒)\n";

          // レイヤー情報
          info += "   レイヤー数: " + comp.numLayers + "\n";
          var audioLayerCount = 0;
          var textLayerCount = 0;

          for (var j = 1; j <= comp.numLayers; j++) {
            if (comp.layer(j).hasAudio) {
              audioLayerCount++;
            }
            if (comp.layer(j).matchName === "ADBE Text Layer") {
              textLayerCount++;
            }
          }

          info += "   オーディオレイヤー数: " + audioLayerCount + "\n";
          info += "   テキストレイヤー数: " + textLayerCount + "\n\n";
        }
      }

      Logger.info("プロジェクト情報表示");
      alert(info);
    } catch (e) {
      Logger.error("プロジェクト情報表示エラー: " + e.toString());
      alert("プロジェクト情報表示エラー: " + e.toString());
    }
  };

  // ログファイルを開く
  var openLogGroup = debugTab.add("panel", undefined, "ログファイル");
  openLogGroup.alignChildren = "fill";

  var buttonOpenLogFile = openLogGroup.add(
    "button",
    undefined,
    "ログファイルを開く"
  );
  buttonOpenLogFile.onClick = function () {
    try {
      var logFilePath = Folder.desktop.absoluteURI;
      var command = "";

      if ($.os.indexOf("Windows") !== -1) {
        command = 'explorer "' + logFilePath + '"';
      } else {
        command = 'open "' + logFilePath + '"';
      }

      system.callSystem(command);
      Logger.info("ログファイルフォルダを開きました");
    } catch (e) {
      Logger.error("ログファイルを開くエラー: " + e.toString());
      alert("ログファイルを開くエラー: " + e.toString());
    }
  };

  // パネルのレイアウトを調整
  panel.layout.layout(true);
  panel.layout.resize();

  // パネルがドッキング可能なパネルの場合はリサイズ
  if (panel instanceof Window) {
    panel.center();
    panel.show();
  }

  Logger.info("UIの構築完了");
  return panel;
}

// After Effectsのバージョンチェック
if (parseFloat(app.version) < 8) {
  alert("このスクリプトはAfter Effects CS3以降が必要です。");
} else {
  // UIを構築
  var myPanel = buildUI(this);
}
