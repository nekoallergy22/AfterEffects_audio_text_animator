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

  var dialog = new Window("dialog", title);
  dialog.orientation = "column";
  dialog.alignChildren = ["center", "top"];
  dialog.spacing = 10;
  dialog.margins = 16;

  // メッセージテキスト
  var messageText = dialog.add("statictext", undefined, message, {
    multiline: true,
  });
  messageText.alignment = ["fill", "top"];
  messageText.preferredSize.width = 300;

  // ボタングループ
  var buttonGroup = dialog.add("group", undefined);
  buttonGroup.orientation = "row";
  buttonGroup.alignChildren = ["center", "center"];
  buttonGroup.spacing = 10;

  var okButton = buttonGroup.add("button", undefined, "OK");
  okButton.preferredSize.width = 80;

  var cancelButton = null;
  if (allowCancel) {
    cancelButton = buttonGroup.add("button", undefined, "中断");
    cancelButton.preferredSize.width = 80;
  }

  var result = true;

  okButton.onClick = function () {
    dialog.close();
  };

  if (allowCancel) {
    cancelButton.onClick = function () {
      result = false;
      isProcessCancelled = true;
      dialog.close();
    };
  }

  dialog.show();
  return result;
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
