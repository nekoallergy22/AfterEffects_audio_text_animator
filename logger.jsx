/**
 * After Effects Audio Text Animator - Logger
 * デバッグ情報をログファイルに記録する機能を提供します
 */

// 処理中断フラグ
var isProcessCancelled = false;

/**
 * カスタムアラートダイアログを表示する関数
 * @param {string} message - 表示するメッセージ
 * @param {string} title - ダイアログのタイトル（省略可）
 * @param {boolean} allowCancel - キャンセルボタンを表示するかどうか
 * @return {boolean} OKボタンが押された場合はtrue、キャンセルボタンが押された場合はfalse
 */
function customAlert(message, title, allowCancel) {
  title = title || "After Effects Audio Text Animator";
  allowCancel = allowCancel === undefined ? false : allowCancel;

  // ScriptUIでは、ダイアログのボタンを直接指定する方法もある
  if (allowCancel) {
    // OKとキャンセルボタンを持つダイアログを表示
    var result = confirm(message, false, title);
    if (!result) {
      isProcessCancelled = true;
    }
    return result;
  } else {
    // OKボタンのみのダイアログを表示
    alert(message, title);
    return true;
  }
}

/**
 * ESCキーを監視して処理を中断する機能を追加
 * After Effectsでは、ESCキーを押すとスクリプトの実行が中断される
 * この機能を利用して、ユーザーに中断方法を伝える
 */
function notifyEscToCancel() {
  alert("処理を中断するには、ESCキーを押してください。", "中断方法");
}

/**
 * 処理が中断されたかどうかを確認する関数
 * @return {boolean} 処理が中断された場合はtrue
 */
function isProcessingCancelled() {
  return isProcessCancelled;
}

/**
 * 処理中断フラグをリセットする関数
 */
function resetCancellationFlag() {
  isProcessCancelled = false;
}

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
        customAlert("ログファイルを作成できませんでした。");
        return false;
      }
    } catch (e) {
      customAlert("ログ初期化エラー: " + e.toString());
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
      customAlert("ログ書き込みエラー: " + e.toString());
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
