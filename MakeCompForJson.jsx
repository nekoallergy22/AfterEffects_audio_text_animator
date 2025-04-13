// MakeCompForJson.jsx
var scriptFolder = new File($.fileName).parent.absoluteURI;

// 各ファイルを読み込む
$.evalFile(scriptFolder + "/logger.jsx");
$.evalFile(scriptFolder + "/jsonHandler.jsx");
$.evalFile(scriptFolder + "/compCreator.jsx");
$.evalFile(scriptFolder + "/ui.jsx");

var logger = new Logger("MakeCompForJson");
logger.log("スクリプトを開始しました");

var myPanel = createUI(this);

logger.log("スクリプトを開始しました");

// パネルとして実行されていない場合はウィンドウを表示
if (!(myPanel instanceof Panel)) {
  myPanel.center();
  myPanel.show();
}

logger.log("UIを作成しました");
