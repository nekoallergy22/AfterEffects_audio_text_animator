// jsonHandler.jsx - JSONファイルの読み込みと解析を担当するモジュール
var jsonData = null;

function loadJSON(panel) {
  var logger = new Logger("JSONHandler");

  try {
    var jsonFile = File.openDialog("JSONファイルを選択", "*.json");
    if (!jsonFile) {
      logger.log("ファイル選択がキャンセルされました");
      return;
    }

    jsonFile.encoding = "UTF-8";
    if (jsonFile.open("r")) {
      var content = jsonFile.read();
      jsonFile.close();

      try {
        jsonData = JSON.parse(content);
        panel.resultText.text = content;

        updateSectionInfo(panel);

        panel.createCompButton.enabled = true;
        logger.log("JSONファイルを正常に読み込みました: " + jsonFile.name);
      } catch (e) {
        alert("JSONの解析に失敗しました: " + e.toString());
        logger.log("JSONの解析に失敗しました: " + e.toString());
        panel.resultText.text = "JSONの解析に失敗しました";
        panel.createCompButton.enabled = false;
      }
    } else {
      logger.log("ファイルを開けませんでした: " + jsonFile.name);
      alert("ファイルを開けませんでした");
    }
  } catch (e) {
    logger.log("JSONファイル読み込み中にエラーが発生しました: " + e.toString());
    alert("JSONファイル読み込み中にエラーが発生しました: " + e.toString());
  }
}
