// jsonHandler.jsx
var jsonData = null;

function loadJSON(panel) {
  var logger = new Logger("JSONHandler");
  var jsonFile = File.openDialog("JSONファイルを選択", "*.json");
  if (jsonFile) {
    jsonFile.encoding = "UTF-8";
    if (jsonFile.open("r")) {
      var content = jsonFile.read();
      jsonFile.close();
      try {
        jsonData = JSON.parse(content);
        panel.resultText.text = content;
        var compCount = jsonData.comp ? jsonData.comp.length : 0;
        var audioCount = jsonData.audio ? jsonData.audio.length : 0;
        panel.sectionCountText.text =
          "comp: " + compCount + "\naudio: " + audioCount;
        panel.createCompButton.enabled = true;
        logger.log("JSONファイルを正常に読み込みました: " + jsonFile.name);
      } catch (e) {
        alert("JSONの解析に失敗しました: " + e.toString());
        logger.log("JSONの解析に失敗しました: " + e.toString());
      }
    }
  }
}
