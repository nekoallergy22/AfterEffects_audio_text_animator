function Logger(scriptName) {
  this.scriptName = scriptName;

  // 拡張子を.txtに変更
  this.logFile = new File(Folder.desktop.fsName + "/MakeCompForJson.txt");

  this.log = function (message) {
    var timestamp = new Date().toLocaleString();
    var logMessage = timestamp + " [" + this.scriptName + "] " + message;

    // ファイルを開く前にエンコーディングを設定
    this.logFile.encoding = "UTF-8";
    this.logFile.open("a");
    this.logFile.writeln(logMessage);
    this.logFile.close();
  };
}
