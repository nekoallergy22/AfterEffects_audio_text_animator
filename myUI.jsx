$.evalFile(
  "/Applications/Adobe After Effects 2024/Scripts/ScriptUI Panels/components.jsx"
);

// スクリプト1のJSONデータ処理関数
function processJSONForCompDuration() {
  var jsonContent = openJsonContents();

  var data = JSON.parse(jsonContent);
  var projData = data.project;
  var compData = data.comp;
  var compNotFound = [];

  var mainDuration = 0;
  for (var i = 0; i < compData.length; i++) {
    var compDuration = compData[i].duration / 1000;
    mainDuration = mainDuration + compDuration;
  }

  var mainCompName = projData.name;
  var mainComp = findCompByName(mainCompName);

  if (mainComp === null) {
    var compName = mainCompName;
    var compWidth = 1920;
    var compHeight = 1080;
    var compPixelAspect = 1; // ピクセルアスペクト比（通常は1）
    var compDuration = mainDuration; // 秒単位
    var compFrameRate = 24; // フレームレート

    var mainComp = createNewComp(
      compName,
      compWidth,
      compHeight,
      compPixelAspect,
      compDuration,
      compFrameRate
    );
  }

  //コンポジションデータを名前順にソート
  compData.sort(function (a, b) {
    return b.name.localeCompare(a.name);
  });

  for (var i = 0; i < compData.length; i++) {
    var compId = compData[i].comp_id.toString();
    var compDuration = compData[i].duration / 1000; // Convert duration from milliseconds to seconds
    var comp = findCompByName(compId);
    if (comp) {
      comp.duration = compDuration;
      placeFileInComp(comp, mainComp);
    } else {
      compNotFound.push(compId);
    }
  }

  sequenceCompLayers(mainComp);

  if (compNotFound.length > 0) {
    alert(
      "The following compositions were not found: " + compNotFound.join(", ")
    );
  } else {
    alert("Comp Durations successfully updated for all listed comps.");
  }
}

// スクリプト2のJSONデータ処理関数
function processJSONForAudioImport() {
  alert("start");
  var jsonContent = openJsonContents();
  var data = JSON.parse(jsonContent);
  var audioData = data.audio;
  var compData = data.comp;
  var fileNotFound = [];
  var compNotFound = [];

  //コンポジションデータを名前順にソート
  compData.sort(function (a, b) {
    return b.name.localeCompare(a.name);
  });

  // オーディオデータを名前順にソート;
  audioData.sort(function (a, b) {
    return b.name.localeCompare(a.name);
  });

  // オーディオファイルをコンポに配置
  for (var i = 0; i < audioData.length; i++) {
    var audioName = audioData[i].name.substring(0, 4);
    var compId = audioData[i].comp_id.toString();
    var audioFile = findFileInProject(audioName);
    var targetComp = findCompByName(compId);

    if (audioFile && targetComp) {
      // alert(compId);
      placeFileInComp(audioFile, targetComp);
    } else {
      if (!audioFile) {
        fileNotFound.push(audioName);
      }
      if (!targetComp) {
        compNotFound.push(compId);
      }
    }
  }

  var numCompData = compData.length;

  for (var i = 0; i < numCompData; i++) {
    var compId = compData[i].name;
    var targetComp = findCompByName(compId);
    if (targetComp) {
      alert(
        "processed [ " +
          targetComp.name +
          " ] completed ! (" +
          i +
          "/" +
          numCompData +
          ")"
      );
      // オーディオレイヤーをシーケンス状に配置する
      sequenceAudioLayers(targetComp);
      // アイテムにモーションを付加
      setAnimetionToAllItem(targetComp);
      // テキストを配置
      insertTextAll(targetComp, 960, 1040);
    }
  }

  if (fileNotFound.length > 0 || compNotFound.length > 0) {
    alert(
      "Some errors occurred:\n" +
        "Files not found: " +
        fileNotFound.join(", ") +
        "\n" +
        "Comps not found: " +
        compNotFound.join(", ")
    );
  } else {
    alert("Audio files successfully imported.");
  }
}

// UIを作成する関数
function createUI(thisObj) {
  var myPanel =
    thisObj instanceof Panel
      ? thisObj
      : new Window("palette", "After Effects Scripting", undefined, {
          resizeable: true,
        });

  // スクリプト1のボタンを追加
  var buttonSetCompDuration = myPanel.add(
    "button",
    undefined,
    "Set Comp Duration"
  );
  buttonSetCompDuration.onClick = processJSONForCompDuration;

  // スクリプト2のボタンを追加
  var buttonImportAudio = myPanel.add(
    "button",
    undefined,
    "Import Audio to Comp"
  );
  buttonImportAudio.onClick = processJSONForAudioImport;

  myPanel.layout.layout(true);
  return myPanel;
}

// スクリプトの実行
if (parseFloat(app.version) < 8) {
  alert("This script requires After Effects CS3 or later.");
} else {
  var myScriptPal = createUI(this);
  if (myScriptPal instanceof Window) {
    myScriptPal.center();
    myScriptPal.show();
  }
}
