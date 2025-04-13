// logger.jsx - ログ機能を提供するモジュール
function Logger(scriptName) {
  this.scriptName = scriptName;
  this.logFile = new File(Folder.desktop.fsName + "/MakeCompForJson.txt");

  this.log = function (message) {
    try {
      var timestamp = new Date().toLocaleString();
      var logMessage = timestamp + " [" + this.scriptName + "] " + message;

      // ファイルを開く前にエンコーディングを設定
      this.logFile.encoding = "UTF-8";
      this.logFile.open("a");
      this.logFile.writeln(logMessage);
      this.logFile.close();
    } catch (e) {
      alert("ログの書き込み中にエラーが発生しました: " + e.toString());
    }
  };
}
