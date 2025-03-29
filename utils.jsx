// utils.jsx

/**
 * 16進数カラーコードをRGB値に変換する関数
 * @param {string} hexColor - 16進数カラーコード
 * @return {Array} RGB値の配列
 */
function colorSetToRgb(hexColor) {
  try {
    Logger.debug("カラー変換開始: " + hexColor);

    // 16進数の形式チェック
    if (!hexColor || hexColor.length < 6) {
      Logger.warn(
        "無効なカラーコード: " + hexColor + " - デフォルト値を使用します"
      );
      return DEFAULT_TEXT.COLOR.concat(1); // アルファ値を追加
    }

    // 先頭の#を削除（もしあれば）
    if (hexColor.charAt(0) === "#") {
      hexColor = hexColor.substr(1);
    }

    var r = parseInt(hexColor.substr(0, 2), 16) / 255;
    var g = parseInt(hexColor.substr(2, 2), 16) / 255;
    var b = parseInt(hexColor.substr(4, 2), 16) / 255;

    // NaNチェック
    if (isNaN(r) || isNaN(g) || isNaN(b)) {
      Logger.warn("カラー変換エラー: 無効な16進数 - デフォルト値を使用します");
      return DEFAULT_TEXT.COLOR.concat(1);
    }

    Logger.debug("カラー変換成功: [" + r + ", " + g + ", " + b + ", 1]");
    return [r, g, b, 1]; // RGBA形式で返す
  } catch (e) {
    Logger.error("カラー変換エラー: " + e.toString());
    return DEFAULT_TEXT.COLOR.concat(1);
  }
}

/**
 * レイヤーのアンカーポイントを中央に設定する関数
 * @param {Layer} layer - 対象のレイヤー
 */
function setLayerAnchorPointToCenter(layer) {
  try {
    var sourceRect = layer.sourceRectAtTime(0, false);
    var width = sourceRect.width;
    var height = sourceRect.height;
    var centerX = sourceRect.left + width / 2;
    var centerY = sourceRect.top + height / 2;
    layer.anchorPoint.setValue([centerX, centerY]);
  } catch (e) {
    Logger.error("アンカーポイント設定エラー: " + e.toString());
  }
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

/**
 * ESCキーを監視して処理を中断する機能を追加
 * After Effectsでは、ESCキーを押すとスクリプトの実行が中断される
 * この機能を利用して、ユーザーに中断方法を伝える
 */
function notifyEscToCancel() {
  alert("処理を中断するには、ESCキーを押してください。", "中断方法");
}

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
