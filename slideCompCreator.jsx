// slideCompCreator.jsx - スライドコンポジション作成機能

// スライドコンポジションを作成する関数
function createSlideCompositions(slideDataArray, parentFolder) {
  var logger = new Logger("SlideCompCreator");
  var slideItems = [];
  var totalDuration = 0;

  for (var i = 0; i < slideDataArray.length; i++) {
    var slideData = slideDataArray[i];
    var slideName = slideData.name;
    var duration = (slideData.duration + slideData.margin) / 1000;

    // 合計時間に加算
    totalDuration += duration;

    var slideComp = createOrUpdateSlideComp(slideName, duration, parentFolder);
    slideItems.push(slideComp);
  }

  return {
    slideItems: slideItems,
    totalDuration: totalDuration,
  };
}

// 個別のスライドコンポジションを作成または更新する関数
function createOrUpdateSlideComp(name, duration, parentFolder) {
  var logger = new Logger("SlideCompCreator");
  var existingComp = findCompByName(name);
  var slideComp;

  if (existingComp) {
    slideComp = existingComp;
    // 必要に応じて既存コンポジションの設定を更新
    if (slideComp.duration !== duration) {
      slideComp.duration = duration;
    }
    logger.log("既存のコンポジションを使用: " + name);
  } else {
    slideComp = app.project.items.addComp(name, 1920, 1080, 1, duration, 30);
    logger.log("新しいコンポジションを作成: " + name);
  }

  // 親フォルダを設定
  if (parentFolder) {
    slideComp.parentFolder = parentFolder;
  }

  return slideComp;
}
