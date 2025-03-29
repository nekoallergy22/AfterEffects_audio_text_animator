// logger.jsx

var Logger = (function () {
  var logFile = null;
  var isEnabled = false;
  var logLevel = 1;

  function init() {
    try {
      var desktopPath = Folder.desktop.absoluteURI;
      var now = new Date();
      var timestamp =
        now.getFullYear() +
        ("0" + (now.getMonth() + 1)).slice(-2) +
        ("0" + now.getDate()).slice(-2) +
        "_" +
        ("0" + now.getHours()).slice(-2) +
        ("0" + now.getMinutes()).slice(-2);
      logFile = new File(
        desktopPath + "/ae_animator_log_" + timestamp + ".txt"
      );
      if (logFile.open("w")) {
        isEnabled = true;
        logFile.encoding = "UTF-8";
        logFile.writeln("=== After Effects Audio Text Animator ログ ===");
        logFile.writeln("開始時間: " + now.toString());
        logFile.writeln("======================================");
        logFile.close();
        return true;
      } else {
        return false;
      }
    } catch (e) {
      return false;
    }
  }

  function writeLog(message, level) {
    if (!isEnabled || level > logLevel) return;
    try {
      if (logFile.open("a")) {
        var prefix = "";
        switch (level) {
          case 0:
            prefix = "[ERROR] ";
            break;
          case 1:
            prefix = "[WARN] ";
            break;
          case 2:
            prefix = "[INFO] ";
            break;
          case 3:
            prefix = "[DEBUG] ";
            break;
          default:
            prefix = "[LOG] ";
        }
        var now = new Date();
        var timestamp =
          ("0" + now.getHours()).slice(-2) +
          ":" +
          ("0" + now.getMinutes()).slice(-2) +
          ":" +
          ("0" + now.getSeconds()).slice(-2);
        logFile.writeln(timestamp + " " + prefix + message);
        logFile.close();
      }
    } catch (e) {
      // エラー処理
    }
  }

  function setLogLevel(level) {
    logLevel = level;
  }

  return {
    init: init,
    debug: function (message) {
      writeLog(message, 3);
    },
    info: function (message) {
      writeLog(message, 2);
    },
    warn: function (message) {
      writeLog(message, 1);
    },
    error: function (message) {
      writeLog(message, 0);
    },
    setLogLevel: setLogLevel,
  };
})();
