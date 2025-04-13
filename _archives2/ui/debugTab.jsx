// ui/debugTab.jsx

function buildDebugTab(tpanel) {
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
  logLevelDropdown.selection = 1;
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
          info += " レイヤー数: " + comp.numLayers + "\n";
          var audioLayerCount = 0;
          var textLayerCount = 0;
          for (var j = 1; j <= comp.numLayers; j++) {
            if (comp.layer(j).hasAudio) audioLayerCount++;
            if (comp.layer(j).matchName === "ADBE Text Layer") textLayerCount++;
          }
          info += " オーディオレイヤー数: " + audioLayerCount + "\n";
          info += " テキストレイヤー数: " + textLayerCount + "\n\n";
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
      var command =
        $.os.indexOf("Windows") !== -1
          ? 'explorer "' + logFilePath + '"'
          : 'open "' + logFilePath + '"';
      system.callSystem(command);
      Logger.info("ログファイルフォルダを開きました");
    } catch (e) {
      Logger.error("ログファイルを開くエラー: " + e.toString());
      alert("ログファイルを開くエラー: " + e.toString());
    }
  };

  return debugTab;
} // buildDebugTab関数の終わり
