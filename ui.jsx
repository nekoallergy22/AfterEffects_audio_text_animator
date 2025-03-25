/**
 * After Effects Audio Text Animator - Main UI
 * ユーザーインターフェースとメイン処理を提供します
 */

// 必要なモジュールを読み込み
$.evalFile(File($.fileName).path + "/utils.jsx");
$.evalFile(File($.fileName).path + "/animations.jsx");
$.evalFile(File($.fileName).path + "/textHandlers.jsx");
$.evalFile(File($.fileName).path + "/jsonHandlers.jsx");

/**
 * UIを作成する関数
 * @param {Object} thisObj - スクリプトのコンテキスト
 * @return {Panel|Window} 作成されたパネルまたはウィンドウ
 */
function createUI(thisObj) {
  var myPanel =
    thisObj instanceof Panel
      ? thisObj
      : new Window("palette", "After Effects Audio Text Animator", undefined, {
          resizeable: true,
        });

  // スクリプト1のボタンを追加
  var buttonSetCompDuration = myPanel.add(
    "button",
    undefined,
    "コンポジション長設定"
  );
  buttonSetCompDuration.onClick = processJSONForCompDuration;

  // スクリプト2のボタンを追加
  var buttonImportAudio = myPanel.add(
    "button",
    undefined,
    "オーディオインポート"
  );
  buttonImportAudio.onClick = processJSONForAudioImport;

  // レイアウトを調整
  myPanel.layout.layout(true);
  return myPanel;
}

/**
 * スクリプトのメイン実行部分
 */
function main() {
  // After Effectsのバージョンチェック
  if (parseFloat(app.version) < 8) {
    alert("このスクリプトはAfter Effects CS3以降が必要です。");
    return;
  }

  // UIを作成して表示
  var myScriptPal = createUI(this);
  if (myScriptPal instanceof Window) {
    myScriptPal.center();
    myScriptPal.show();
  }
}

// スクリプトを実行
main();
