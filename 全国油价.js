// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-brown; icon-glyph: gas-pump;
/**
* 小组件作者: 95度茅台
* Oil price
* Version 1.2
* 2022-11-19 11:30
* Telegram 交流群 https://t.me/+ViT7uEUrIUV0B_iy
*/

// ⚠️适配机型: 手动第10行的数字
const value = 30 //小机型改小

    const administrativeArea = '江苏省'
    const province = `${administrativeArea.replace('省', '')}`;

const Req = new Request('https://mys4s.cn/v3/oil/price');
Req.method = 'POST'
Req.body = `region=${province}`
const Res = await Req.loadJSON();
const oil = Res.data

const req = new Request('http://m.qiyoujiage.com');
const html = await req.loadString();
const rule = 'var tishiContent="(.*?)";';
const forecast = html.match(new RegExp(rule,"g")).map(str=>{
  const forecast = str.match(new RegExp(rule));  
  const regex = /<br\/>/g;
  const value = forecast[1].split(regex)
  return value
});
    
const widget = await createWidget(oil);
const fileManager = FileManager.iCloud();
const folder = fileManager.joinPath(fileManager.documentsDirectory(), "oil");
const cacheFile = fileManager.joinPath(folder, 'data.json');
  
if (config.widgetFamily === "small") {return}
  
if (config.runsInWidget) {
  Script.setWidget(widget)
  Script.complete()
} else {
  await widget.presentMedium();
}
    
  
async function createWidget(oil, data) {
  // 组件背景渐变
  const widget = new ListWidget()
  widget.backgroundColor = Color.white();
  const gradient = new LinearGradient()
    color = [
    "#82B1FF", 
    "#757575", 
    "#4FC3F7",
    "#66CCFF",
    "#99CCCC",
    "#BCBBBB"
    ]
  const items = color[Math.floor(Math.random()*color.length)];
  gradient.locations = [0, 1]
  gradient.colors = [
    new Color(`${items}`, 0.5),
    new Color('#00000000')
  ]
  widget.backgroundGradient = gradient

    
  // 灵动岛
  widget.setPadding(6, 6, 6, 6);
  const mainStack = widget.addStack();
  mainStack.layoutVertically();
  const Stack = mainStack.addStack();
  Stack.addSpacer()
  // Dynamic Island bar
  const barStack = Stack.addStack();
  barStack.backgroundColor = Color.black();
  barStack.setPadding(5, 42, 5, 42);
  barStack.cornerRadius = 15
  barStack.borderColor = Color.black();
  barStack.borderWidth = 3
  //Text Color
  const titleText = barStack.addText(`${province}油价`);
  titleText.textColor = Color.green();
  titleText.font = Font.boldSystemFont(16)
  titleText.centerAlignText();
  Stack.addSpacer(5);
  
  // Notification icon
  const noticeStack = Stack.addStack();
  const iconSymbol2 = SFSymbol.named('bell.circle');
  const carIcon = noticeStack.addImage(iconSymbol2.image);
  carIcon.imageSize = new Size(29, 29);
  carIcon.tintColor = Color.black();
  Stack.addSpacer()
  mainStack.addSpacer(10)
    
  // oilPrice alert ‼️
  const dataStack2 = mainStack.addStack();
  dataStack2.layoutHorizontally();
  dataStack2.addSpacer()
  // bar
  const barStack1 = dataStack2.addStack();
  barStack1.setPadding(8, 10, 8, 10);
  barStack1.backgroundColor = new Color('#EEEEEE', 0.1);
  barStack1.cornerRadius = 10
  barStack1.borderColor = new Color('#D50000', 0.8);
  barStack1.borderWidth = 2.5
  // bar text
  const oilTipsText = barStack1.addText(`${forecast}`);
  oilTipsText.textColor = new Color('#484848');
  oilTipsText.font = Font.boldSystemFont(10);
  oilTipsText.centerAlignText();
  //barStack1.addSpacer(16)
  dataStack2.addSpacer()
  mainStack.addSpacer(10)
  
  
  // First column ❤️
  const dataStack = mainStack.addStack();
  dataStack.addSpacer()
  // Oil_0 bar
  const barStack0 = dataStack.addStack();
  barStack0.setPadding(3, 8, 3, 8);
  barStack0.backgroundColor = new Color('#FB8C00');
  barStack0.cornerRadius = 10
  barStack0.borderColor = new Color('#FB8C00');
  barStack0.borderWidth = 3
  // bar text
  let oil0 = `${oil.Oil0}`
  const a = {};
  a.GetLength = function(str) {
    return str.replace(/[\u0391-\uFFE5]/g,"@@").length;
  };  
  str0 = (a.GetLength(oil0));
    
  if (str0 <= 3) {
    totalMonthBar0 = barStack0.addText(`0# - ${oil.Oil0}0`);
  } else if (str0 > 4) {
    oil0 = oil0.replace(/\S{1}$/, '');
    totalMonthBar0 = barStack0.addText(`0# - ${oil0}`);
  } else {
    totalMonthBar0 = barStack0.addText(`0# - ${oil.Oil0}`);
  }
  totalMonthBar0.font = Font.mediumSystemFont(15);
  totalMonthBar0.textColor = Color.white();
  dataStack.addSpacer(value)
  
  
  // Second column ❤️
  // Oil_92 bar
  const barStack2 = dataStack.addStack();
  barStack2.setPadding(3, 8, 3, 8);
  barStack2.backgroundColor = Color.blue();
  barStack2.cornerRadius = 10
  barStack2.borderColor = Color.blue();
  barStack2.borderWidth = 3
  // bar text
  let oil92 = `${oil.Oil92}`
  const b = {};
  b.GetLength = function(str) {
    return str.replace(/[\u0391-\uFFE5]/g,"@@").length;
  };  
  str92 = (b.GetLength(oil92));
  if (str92 <= 3) {
    totalMonthBar2 = barStack2.addText(`92 - ${oil.Oil92}0`);
  } else if (str92 > 4) {
    oil92 = oil92.replace(/\S{1}$/, '');
    totalMonthBar2 = barStack2.addText(`0# - ${oil92}`);
  } else {
    totalMonthBar2 = barStack2.addText(`92 - ${oil.Oil92}`);
  }
  totalMonthBar2.font = Font.mediumSystemFont(14);
  totalMonthBar2.textColor = new Color('#FFFFFF');
  dataStack.addSpacer(value)
  
  
  // Third column ❤️
  // Oil_95 bar
  const barStack5 = dataStack.addStack();
  barStack5.setPadding(3, 8, 3, 8);
  barStack5.backgroundColor = new Color('#00C853');
  barStack5.cornerRadius = 10
  barStack5.borderColor = new Color('#00C853');
  barStack5.borderWidth = 3
  // bar text
  let oil95 = `${oil.Oil95}`
  const c = {};
  c.GetLength = function(str) {
    return str.replace(/[\u0391-\uFFE5]/g,"@@").length;
  };  
  str95 = (c.GetLength(oil95));
  if (str95 <= 3) {
    totalMonthBar5 = barStack5.addText(`95 - ${oil.Oil95}0`);
  } else if (str95 > 4) {
    oil95 = oil95.replace(/\S{1}$/, '');
    totalMonthBar5 = barStack5.addText(`95 - ${oil95}`);
  } else {
    totalMonthBar5 = barStack5.addText(`95 - ${oil.Oil95}`);
  }
  totalMonthBar5.font = Font.mediumSystemFont(14);
  totalMonthBar5.textColor = new Color('#FFFFFF');
  dataStack.addSpacer(value)
  
    
  // Fourth column ❤️
  // Oil_98 bar
  const barStack8 = dataStack.addStack();
  barStack8.setPadding(3, 8, 3, 8);
  barStack8.backgroundColor = Color.purple();
  barStack8.cornerRadius = 10
  barStack8.borderColor = Color.purple();
  barStack8.borderWidth = 3
  // bar text
  let oil98 = `${oil.Oil98}`
  const d = {};
  d.GetLength = function(str) {
    return str.replace(/[\u0391-\uFFE5]/g,"@@").length;
  };  
  str98 = (d.GetLength(oil98));
  if (str98 <= 3) {
    totalMonthBar8 = barStack8.addText(`98 号 ${oil.Oil98}0`);
  } else if (str98 > 4) {
    oil98 = oil98.replace(/\S{1}$/, '');
    totalMonthBar8 = barStack8.addText(`98 - ${oil98}`);
  } else {
    totalMonthBar8 = barStack8.addText(`98 - ${oil.Oil98}`);  
  }
  totalMonthBar8.font = Font.mediumSystemFont(14);
  totalMonthBar8.textColor = new Color('#FFFFFF');
  dataStack.addSpacer()
  return widget;
}


// readString
if (fileManager.fileExists(cacheFile)) {
  data = fileManager.readString(cacheFile)
  data = JSON.parse(data)
} else {
  if (!fileManager.fileExists(folder)) {fileManager.createDirectory(folder)}
  data = {"oil":`${forecast}`}
  data = JSON.stringify(data);
  fileManager.writeString(cacheFile, data);
  return;
}
  
var adjustment = `${forecast}`
if (adjustment !== data.oil) {
  const notice = new Notification()
  notice.sound = 'alert'
  notice.title = `${province}油价涨跌调整‼️`
  notice.body = adjustment
  notice.openURL = 'https://mys4s.cn/v3/oil/price'
  notice.schedule();
    
  // writeString
  if (fileManager.fileExists(folder)) {
    data = {"oil":`${forecast}`}
    data = JSON.stringify(data);
    fileManager.writeString(cacheFile, data);
  }
}
  
  
async function shadowImage(img) {
  let ctx = new DrawContext()
  ctx.size = img.size
  ctx.drawImageInRect(img, new Rect(0, 0, img.size['width'], img.size['height']))
  // 图片遮罩颜色、透明度设置
  ctx.setFillColor(new Color("#000000", 0.3))
  ctx.fillRect(new Rect(0, 0, img.size['width'], img.size['height']))
  let res = await ctx.getImage()
  return res
}