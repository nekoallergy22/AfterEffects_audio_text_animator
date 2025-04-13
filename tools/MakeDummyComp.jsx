function createUI(thisObj) {
  var panel =
    thisObj instanceof Panel
      ? thisObj
      : new Window("palette", "自動コンポジション作成", [100, 100, 420, 420]);

  // タイトル
  panel.add("statictext", [20, 20, 380, 40], "自動コンポジション作成ツール");

  // コンポジション数の入力
  panel.add("statictext", [20, 60, 180, 80], "作成するコンポジション数:");
  var compCountInput = panel.add("edittext", [190, 60, 270, 80], "12");

  // コンポジション設定
  panel.add("statictext", [20, 100, 380, 120], "コンポジション設定");

  // 名前のプレフィックス
  panel.add("statictext", [20, 130, 180, 150], "名前のプレフィックス:");
  var prefixInput = panel.add("edittext", [190, 130, 380, 150], "Comp_");

  // 幅
  panel.add("statictext", [20, 160, 180, 180], "幅 (px):");
  var widthInput = panel.add("edittext", [190, 160, 270, 180], "1920");

  // 高さ
  panel.add("statictext", [20, 190, 180, 210], "高さ (px):");
  var heightInput = panel.add("edittext", [190, 190, 270, 210], "1080");

  // フレームレート
  panel.add("statictext", [20, 220, 180, 240], "フレームレート:");
  var fpsInput = panel.add("edittext", [190, 220, 270, 240], "30");

  // 時間
  panel.add("statictext", [20, 250, 180, 270], "長さ (秒):");
  var durationInput = panel.add("edittext", [190, 250, 270, 270], "10");

  // ステータス表示エリア
  var statusText = panel.add("statictext", [20, 310, 380, 330], "");

  // 作成ボタン
  var createButton = panel.add(
    "button",
    [130, 340, 290, 370],
    "コンポジション作成"
  );

  // ボタンクリック時の処理
  createButton.onClick = function () {
    try {
      var compCount = parseInt(compCountInput.text);
      if (isNaN(compCount) || compCount <= 0) {
        statusText.text = "エラー: 有効な数値を入力してください";
        writeLog("エラー: 有効な数値を入力してください");
        return;
      }

      var prefix = prefixInput.text;
      var width = parseInt(widthInput.text);
      var height = parseInt(heightInput.text);
      var fps = parseFloat(fpsInput.text);
      var duration = parseFloat(durationInput.text);

      if (isNaN(width) || isNaN(height) || isNaN(fps) || isNaN(duration)) {
        statusText.text = "エラー: すべての設定に有効な数値を入力してください";
        writeLog("エラー: すべての設定に有効な数値を入力してください");
        return;
      }

      createCompositions(compCount, prefix, width, height, fps, duration);
      statusText.text = compCount + "個のコンポジションを作成しました";
      writeLog(compCount + "個のコンポジションを作成しました");
    } catch (e) {
      statusText.text = "エラー: " + e.message;
      writeLog("エラー: " + e.message);
    }
  };

  return panel;
}

// コンポジション作成関数
function createCompositions(count, prefix, width, height, fps, duration) {
  var project = app.project;

  for (var i = 1; i <= count; i++) {
    var compName = prefix + i;
    var durationInSeconds = duration;
    var durationInFrames = durationInSeconds * fps;

    // 既存のコンポジションを確認
    var existingComp = null;
    for (var j = 1; j <= project.numItems; j++) {
      if (
        project.item(j) instanceof CompItem &&
        project.item(j).name === compName
      ) {
        existingComp = project.item(j);
        break;
      }
    }

    if (existingComp) {
      // 既存のコンポジションを更新
      existingComp.width = width;
      existingComp.height = height;
      existingComp.frameRate = fps;
      existingComp.duration = durationInSeconds;
      writeLog("コンポジション '" + compName + "' を更新しました");
    } else {
      // 新規コンポジションを作成
      var newComp = project.items.addComp(
        compName,
        width,
        height,
        1,
        durationInSeconds,
        fps
      );
      writeLog("コンポジション '" + compName + "' を作成しました");
    }
  }
}

// ログ出力関数
function writeLog(message) {
  try {
    var logFile = new File(Folder.desktop.fsName + "/ae_comp_creator_log.txt");
    logFile.open("a");
    var timestamp = new Date().toLocaleString();
    logFile.write(timestamp + ": " + message + "\n");
    logFile.close();
  } catch (e) {
    // ログ書き込みエラーは無視
  }
}

// パネル作成
var myPanel = createUI(this);

// パネルとして実行されていない場合はウィンドウを表示
if (!(myPanel instanceof Panel)) {
  myPanel.center();
  myPanel.show();
}
