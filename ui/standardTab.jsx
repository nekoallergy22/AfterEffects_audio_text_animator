// ui/standardTab.jsx

function buildStandardTab(tpanel) {
  var standardTab = tpanel.add("tab", undefined, "標準モード");
  standardTab.alignChildren = "fill";

  var standardInfo = standardTab.add(
    "statictext",
    undefined,
    "標準モードでは、すべての処理を一度に実行します。\n処理中はESCキーで中断できます。",
    { multiline: true }
  );
  standardInfo.alignment = ["fill", "top"];
  standardInfo.preferredSize.height = 40;

  var buttonProcessAll = standardTab.add(
    "button",
    undefined,
    "すべての処理を実行"
  );
  buttonProcessAll.size = [UI_SETTINGS.BUTTON_WIDTH, UI_SETTINGS.BUTTON_HEIGHT];
  buttonProcessAll.onClick = function () {
    resetCancellationFlag();
    notifyEscToCancel();
    Logger.info("標準モードですべての処理を開始");

    var jsonContent = openJsonContents();
    if (!jsonContent) return;

    try {
      var data = JSON.parse(jsonContent);
      processJSONForCompDuration(data);
      if (isProcessingCancelled()) return;
      processJSONForAudioImport(data);
      if (isProcessingCancelled()) return;
      applyAnimationsToAllItems(app.project.activeItem);
      Logger.info("すべての処理が完了しました");
      customAlert("すべての処理が完了しました", "処理完了");
    } catch (e) {
      Logger.error("処理エラー: " + e.toString());
      customAlert("処理中にエラーが発生しました: " + e.toString(), "エラー");
    }
  };

  return standardTab;
} // buildStandardTab関数の終わり
