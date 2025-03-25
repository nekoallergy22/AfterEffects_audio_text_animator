/**
 * After Effects Audio Text Animator - Logger
 * デバッグ情報をログファイルに記録する機能を提供します
 */

var Logger = (function () {
  // プライベート変数
  var logFile = null;
  var isEnabled = false;
  var logLevel = 1; // 0: エラーのみ, 1: 警告とエラー, 2: 情報、警告、エラー, 3: すべて（デバッグ情報含む）

  // ログファイルを初期化
  function init() {
    try {
      // デスクトップにログファイルを作成
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
        alert("ログファイルを作成できませんでした。");
        return false;
      }
    } catch (e) {
      alert("ログ初期化エラー: " + e.toString());
      return false;
    }
  }

  // ログを書き込む
  function writeLog(message, level) {
    if (!isEnabled || level > logLevel) return;

    try {
      if (logFile.open("a")) {
        var prefix = "";
        switch (level) {
          case 0:
            prefix = "[エラー] ";
            break;
          case 1:
            prefix = "[警告] ";
            break;
          case 2:
            prefix = "[情報] ";
            break;
          case 3:
            prefix = "[デバッグ] ";
            break;
          default:
            prefix = "[ログ] ";
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
      // ログ書き込みエラーの場合はアラートを表示
      alert("ログ書き込みエラー: " + e.toString());
    }
  }

  // ログレベルを設定
  function setLogLevel(level) {
    logLevel = level;
  }

  // パブリックメソッド
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
