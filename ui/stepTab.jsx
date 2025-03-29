// ui/stepTab.jsx

function buildStepTab(tpanel) {
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
  buttonLoadJSON.size = [UI_SETTINGS.BUTTON_WIDTH, UI_SETTINGS.BUTTON_HEIGHT];
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
        customAlert(
          "JSONファイル読み込み成功\nコンポジション数: " +
            jsonData.comp.length +
            "\nオーディオファイル数: " +
            jsonData.audio.length
        );
      }
    } catch (e) {
      Logger.error("JSONファイル読み込みエラー: " + e.toString());
      customAlert("JSONファイル読み込みエラー: " + e.toString(), "エラー");
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
  buttonSetupComps.size = [UI_SETTINGS.BUTTON_WIDTH, UI_SETTINGS.BUTTON_HEIGHT];
  buttonSetupComps.onClick = function () {
    if (!jsonData) {
      customAlert("先にJSONファイルを読み込んでください");
      return;
    }
    processJSONForCompDuration();
  };

  // ステップ3: オーディオ配置
  var step3Group = stepTab.add("panel", undefined, "ステップ3: オーディオ配置");
  step3Group.alignChildren = "fill";

  var buttonPlaceAudio = step3Group.add("button", undefined, "オーディオ配置");
  buttonPlaceAudio.size = [UI_SETTINGS.BUTTON_WIDTH, UI_SETTINGS.BUTTON_HEIGHT];
  buttonPlaceAudio.onClick = function () {
    if (!jsonData) {
      customAlert("先にJSONファイルを読み込んでください");
      return;
    }
    processJSONForAudioImport();
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
  buttonSequenceAudio.size = [
    UI_SETTINGS.BUTTON_WIDTH,
    UI_SETTINGS.BUTTON_HEIGHT,
  ];
  buttonSequenceAudio.onClick = function () {
    if (!jsonData) {
      customAlert("先にJSONファイルを読み込んでください");
      return;
    }

    var compData = jsonData.comp;
    var processedComps = 0;

    compData.sort(function (a, b) {
      return parseInt(a.comp_id) - parseInt(b.comp_id);
    });

    for (var i = 0; i < compData.length; i++) {
      var compId = compData[i].comp_id.toString();
      var targetComp = findCompByName(compId);
      if (targetComp) {
        sequenceAudioLayers(targetComp);
        processedComps++;
      }
    }

    customAlert(
      "オーディオシーケンス配置完了\n処理されたコンポジション数: " +
        processedComps
    );
  };

  // ステップ5: テキスト挿入
  var step5Group = stepTab.add("panel", undefined, "ステップ5: テキスト挿入");
  step5Group.alignChildren = "fill";

  var buttonInsertText = step5Group.add("button", undefined, "テキスト挿入");
  buttonInsertText.size = [UI_SETTINGS.BUTTON_WIDTH, UI_SETTINGS.BUTTON_HEIGHT];
  buttonInsertText.onClick = function () {
    if (!jsonData) {
      customAlert("先にJSONファイルを読み込んでください");
      return;
    }

    var compData = jsonData.comp;
    var processedComps = 0;
    var totalTextLayers = 0;

    compData.sort(function (a, b) {
      return parseInt(a.comp_id) - parseInt(b.comp_id);
    });

    for (var i = 0; i < compData.length; i++) {
      var compId = compData[i].comp_id.toString();
      var targetComp = findCompByName(compId);
      if (targetComp) {
        var audioLayerCount = countAudioLayers(targetComp);
        if (audioLayerCount > 0) {
          var addedLayers = insertTextForAllAudioLayers(
            targetComp,
            960,
            1040,
            true
          );
          totalTextLayers += addedLayers;
        }
        processedComps++;
      }
    }

    customAlert(
      "テキスト挿入完了\n処理されたコンポジション数: " +
        processedComps +
        "\n追加されたテキストレイヤー数: " +
        totalTextLayers
    );
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
  buttonApplyAnimation.size = [
    UI_SETTINGS.BUTTON_WIDTH,
    UI_SETTINGS.BUTTON_HEIGHT,
  ];
  buttonApplyAnimation.onClick = function () {
    if (!jsonData) {
      customAlert("先にJSONファイルを読み込んでください");
      return;
    }

    var compData = jsonData.comp;
    var processedComps = 0;

    compData.sort(function (a, b) {
      return parseInt(a.comp_id) - parseInt(b.comp_id);
    });

    for (var i = 0; i < compData.length; i++) {
      var compId = compData[i].comp_id.toString();
      var targetComp = findCompByName(compId);
      if (targetComp) {
        applyAnimationsToAllItems(targetComp, true);
        processedComps++;
      }
    }

    customAlert(
      "アニメーション適用完了\n処理されたコンポジション数: " + processedComps
    );
  };

  return stepTab;
} // buildStepTab関数の終わり
