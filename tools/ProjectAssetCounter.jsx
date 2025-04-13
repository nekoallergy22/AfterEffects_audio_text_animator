// ProjectAssetCounter.jsx
// AfterEffects拡張機能：プロジェクト内のアセット数をカウント

function createUI(thisObj) {
  var myPanel =
    thisObj instanceof Panel
      ? thisObj
      : new Window(
          "palette",
          "プロジェクトアセットカウンター",
          [100, 100, 350, 400]
        );

  // テキスト表示エリア
  myPanel.staticText = myPanel.add(
    "statictext",
    [10, 10, 240, 30],
    "プロジェクト内のアセット数を確認します"
  );

  // 結果表示エリア
  myPanel.resultText = myPanel.add("edittext", [10, 40, 240, 140], "", {
    multiline: true,
    readonly: true,
  });

  // カウントボタン
  myPanel.countButton = myPanel.add(
    "button",
    [10, 150, 240, 180],
    "アセット数カウント"
  );

  // ステータス表示エリア
  myPanel.statusText = myPanel.add("statictext", [10, 190, 240, 210], "");

  return myPanel;
}

// UIパネルを作成
var myToolsPanel = createUI(this);

// ログファイルのパスを取得する関数
function getLogFilePath() {
  var userDesktop = Folder.desktop;
  return userDesktop.fsName + "/ae_asset_counter_log.txt";
}

// ログを出力する関数
function writeLog(message) {
  try {
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
      myToolsPanel.statusText.text =
        "ログが保存されました: " + getLogFilePath();
      return true;
    } else {
      myToolsPanel.statusText.text = "ログエラー: " + logFile.error;
      return false;
    }
  } catch (e) {
    myToolsPanel.statusText.text = "ログエラー: " + e.message;
    return false;
  }
}

// プロジェクト内のアセット数をカウントする関数
function countProjectAssets() {
  try {
    if (!app.project) {
      return {
        error: "プロジェクトが開かれていません",
      };
    }

    var counts = {
      comp: 0,
      audio: 0,
      img: 0,
      video: 0,
      other: 0,
    };

    // プロジェクト内のすべてのアイテムをチェック
    for (var i = 1; i <= app.project.numItems; i++) {
      var item = app.project.item(i);

      if (item instanceof CompItem) {
        counts.comp++;
      } else if (item instanceof FootageItem) {
        if (item.mainSource instanceof FileSource) {
          var fileExt = item.file ? item.file.name.toLowerCase() : "";

          // オーディオファイルの判定
          if (/\.(wav|mp3|aac|m4a|aif|aiff|ogg)$/i.test(fileExt)) {
            counts.audio++;
          }
          // 画像ファイルの判定
          else if (
            /\.(jpg|jpeg|png|gif|tif|tiff|psd|ai|eps|pdf|svg|exr|tga|bmp)$/i.test(
              fileExt
            )
          ) {
            counts.img++;
          }
          // 動画ファイルの判定
          else if (
            /\.(mp4|mov|avi|mxf|r3d|braw|wmv|mkv|webm)$/i.test(fileExt)
          ) {
            counts.video++;
          } else {
            counts.other++;
          }
        } else {
          counts.other++;
        }
      } else {
        counts.other++;
      }
    }

    return counts;
  } catch (e) {
    return {
      error: e.message,
    };
  }
}

// カウントボタンのクリックイベント
myToolsPanel.countButton.onClick = function () {
  try {
    myToolsPanel.statusText.text = "カウント中...";
    var counts = countProjectAssets();

    if (counts.error) {
      alert("エラー: " + counts.error);
      writeLog("エラー: " + counts.error);
      myToolsPanel.statusText.text = "エラー: " + counts.error;
      return;
    }

    var resultMessage =
      "comp: " +
      counts.comp +
      "\n" +
      "audio: " +
      counts.audio +
      "\n" +
      "img: " +
      counts.img +
      "\n" +
      "video: " +
      counts.video +
      "\n" +
      "other: " +
      counts.other;

    myToolsPanel.resultText.text = resultMessage;
    writeLog("アセットカウント結果:\n" + resultMessage);
    myToolsPanel.statusText.text = "カウント完了";
    alert("アセットカウント完了\n\n" + resultMessage);
  } catch (e) {
    alert("エラーが発生しました: " + e.message);
    writeLog("エラー: " + e.message);
    myToolsPanel.statusText.text = "エラー: " + e.message;
  }
};

// パネル初期化時のログ
writeLog("パネルが初期化されました");

// パネルとして実行されていない場合はウィンドウを表示
if (!(myToolsPanel instanceof Panel)) {
  myToolsPanel.center();
  myToolsPanel.show();
}
