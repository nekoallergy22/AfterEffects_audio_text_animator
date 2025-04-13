// SimpleExtension.jsx
// AfterEffects拡張機能のシンプルなUI

(function () {
  // ウィンドウを作成
  var panelGlobal = this;
  var win =
    panelGlobal instanceof Panel
      ? panelGlobal
      : new Window("palette", "シンプル拡張機能", undefined);
  win.orientation = "column";
  win.alignChildren = ["center", "top"];
  win.spacing = 10;
  win.margins = 16;

  // テキスト表示エリア
  var staticText = win.add(
    "statictext",
    undefined,
    "ここにテキストが表示されます"
  );
  staticText.alignment = ["fill", "top"];

  // 入力フィールド
  var inputText = win.add("edittext", undefined, "");
  inputText.alignment = ["fill", "top"];
  inputText.preferredSize.width = 200;

  // ボタングループ
  var buttonGroup = win.add("group", undefined);
  buttonGroup.orientation = "row";
  buttonGroup.alignChildren = ["center", "center"];
  buttonGroup.spacing = 10;
  buttonGroup.margins = 0;

  // 実行ボタン
  var executeButton = buttonGroup.add("button", undefined, "実行");
  executeButton.preferredSize.width = 90;

  // ログ出力ボタン
  var logButton = buttonGroup.add("button", undefined, "ログ出力");
  logButton.preferredSize.width = 90;

  // ログファイルのパスを取得する関数
  function getLogFilePath() {
    var userDesktop = Folder.desktop;
    return userDesktop.fsName + "/ae_extension_log.txt";
  }

  // ログを出力する関数
  function writeLog(message) {
    var logFile = new File(getLogFilePath());
    var now = new Date();
    var timestamp =
      now.getFullYear() +
      "-" +
      ("0" + (now.getMonth() + 1)).slice(-2) +
      "-" +
      ("0" + now.getDate()).slice(-2) +
      " " +
      ("0" + now.getHours()).slice(-2) +
      ":" +
      ("0" + now.getMinutes()).slice(-2) +
      ":" +
      ("0" + now.getSeconds()).slice(-2);

    if (logFile.exists) {
      logFile.open("a"); // 追記モード
    } else {
      logFile.open("w"); // 新規作成
    }

    if (logFile.error === "") {
      logFile.writeln(timestamp + ": " + message);
      logFile.close();
      return true;
    } else {
      alert("ログファイルに書き込めませんでした: " + logFile.error);
      return false;
    }
  }

  // 実行ボタンのクリックイベント
  executeButton.onClick = function () {
    try {
      var inputValue = inputText.text;
      if (inputValue === "") {
        alert("テキストを入力してください");
        writeLog("エラー: テキストが入力されていません");
        return;
      }

      staticText.text = "入力されたテキスト: " + inputValue;
      writeLog("実行: " + inputValue);
      alert("処理が完了しました");
    } catch (e) {
      alert("エラーが発生しました: " + e.message);
      writeLog("エラー: " + e.message);
    }
  };

  // ログ出力ボタンのクリックイベント
  logButton.onClick = function () {
    try {
      var logPath = getLogFilePath();
      writeLog("ログボタンがクリックされました");
      alert("ログファイルが以下に出力されました:\n" + logPath);
    } catch (e) {
      alert("ログ出力中にエラーが発生しました: " + e.message);
    }
  };

  // パネルとして実行されていない場合はウィンドウを表示
  if (!(panelGlobal instanceof Panel)) {
    win.center();
    win.show();
  } else {
    win.layout.layout(true);
  }
})();
