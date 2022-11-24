// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: red; icon-glyph: phone-volume;
/**
 * 中国联通信息展示和自动签到
 * 
 * 中国联通手机营业厅的 URL Scheme：`chinaunicom://`，可用于点击小组件打开手机营业厅客户端
 *
 * @version 1.0.1
 * @author Honye
 */



const getImage = async (url) => {
  const request = new Request(url);
  const image = await request.loadImage();
  return image
};

const files = FileManager.local();
/**
 * 修改为你的 cookie，cookie 获取方法，需在联通客户端中进行抓包
 *
 * 为方便多手机号使用多个组件优先采用本文件配置，其次使用 Config.js 配置
 */
let conf = {
  /** 手机号 */
  phone: '',
  /** m.client.10010.com API cookie */
  clientCookie: '',
  /** act.10010.com API cookie  */
  actionCookie: ''
};
const Tel = conf.phone;
const clientCookie = conf.clientCookie;
const Cookie = conf.actionCookie;
const ringStackSize = 61; // 圆环大小
const ringTextSize = 11; // 圆环中心文字大小
const creditTextSize = 13; // 话费文本大小
const mlTextSize = 12; //免流文字大小
const databgColor = new Color('22976B', 0.3); // 流量环背景颜色
const datafgColor = new Color('22976B'); // 流量环前景颜色
const dataTextColor = Color.dynamic(Color.black(), Color.white());
const voicebgColor = new Color('F86527', 0.3); // 语音环背景颜色
const voicefgColor = new Color('F86527'); // 语音环前景颜色

const dataSfs = SFSymbol.named('antenna.radiowaves.left.and.right');
dataSfs.applyHeavyWeight();
const dataIcon = dataSfs.image;
const canvSize = 178;
const canvas = new DrawContext();
const canvWidth = 18;
const canvRadius = 80;
const widget = new ListWidget();
// widget.url = 'chinaunicom://';
widget.setPadding(16, 16, 16, 16);

const main = async () => {
  if (config.runsInWidget) {
    await render();
    return
  }

  const actions = ['Preview', 'Update'];
  const alert = new Alert();
  alert.message = 'Preview the widget or update the script. Update will override the whole script.';
  for (const action of actions) {
    alert.addAction(action);
  }
  alert.addCancelAction('Cancel');
  const index = await alert.presentSheet();
  switch (actions[index]) {
    case 'Preview':
      render();
      break
    case 'Update':
      console.log('运行成功0 ')
      break
  }
};

const render = async () => {
  const data = await getData();
  const mlData = await get_mlData();
  /** [话费, 流量, 语音] */
  const [phoneData, credit, voice] = data.data.dataList;
  //await setBackground();

  const { signinState, _state } = data;
  const status = _state === 'expired'
    ? 'failed'
    : _state === 'signin_failed'
      ? 'warning'
      : signinState === '1'
        ? 'waiting'
        : 'success';
  await renderLogo(status);
  await renderBalance(phoneData.number);
  await renderML( mlData.summary.freeFlow );
  await renderArcs(credit, voice);

  if (!config.runsInWidget) {
    await widget.presentSmall();
  }
  Script.setWidget(widget);
  Script.complete();
};




/**
 * 联通 Logo 显示
 * @param {'waiting'|'success'|'warning'|'failed'} status
 */
const renderLogo = async (status) => {
  const stackStatus = widget.addStack();
  stackStatus.addSpacer();
  const iconStatus = stackStatus.addImage(SFSymbol.named('circle.fill').image);
  iconStatus.imageSize = new Size(6, 6);
  const colors = {
    waiting: Color.gray(),
    success: Color.green(),
    warning: Color.orange(),
    failed: Color.red()
  };
  iconStatus.tintColor = colors[status];
  const cuIconUrl = 'https://jun.fly.dev/imgs/chinaunicom.png';
  const headerStack = widget.addStack();
  headerStack.addSpacer();
  const logo = headerStack.addImage(await getImage(cuIconUrl));
  logo.imageSize = new Size(393 * 0.25, 118 * 0.25);
  headerStack.addSpacer();
  widget.addSpacer();
};

/** 余额显示 */
const renderBalance = async (balance) => {
  const stack = widget.addStack();
  stack.centerAlignContent();
  stack.addSpacer();
  const elText = stack.addText( "余额: ¥"  +  balance);
  elText.textColor = dataTextColor;
  elText.font = Font.mediumRoundedSystemFont(creditTextSize);
  stack.addSpacer();
  widget.addSpacer();
};




/** ml显示 */
const renderML = async (ml) => {
  const stack = widget.addStack();
  stack.centerAlignContent();
  stack.addSpacer();
  const elText = stack.addText( "免: "  +  ml + " MB");
  elText.textColor = dataTextColor;
  elText.font = Font.mediumRoundedSystemFont(mlTextSize);
  stack.addSpacer();
  widget.addSpacer();
};
/**
 * @typedef {object} Data
 * @property {number} number
 * @property {string} unit
 * @property {number} percent
 */

/**
 * @param {Data} flowData
 * @param {Data} voiceData
 */
const renderArcs = async (flowData, voiceData) => {
  const bodyStack = widget.addStack();
  bodyStack.layoutVertically();

  canvas.size = new Size(canvSize, canvSize);
  canvas.opaque = false;
  canvas.respectScreenScale = true;

  const dataGap = ( 1 - (flowData.number/1024) )* 3.6;
// const dataGap = 0.96;
//   console.log(flowData)
  const voiceGap = (   voiceData.number/50) 
// console.log(voiceData)

  drawArc(dataGap, datafgColor, databgColor);
  const ringStack = bodyStack.addStack();
  const ringLeft = ringStack.addStack();
  ringLeft.layoutVertically();
  ringLeft.size = new Size(ringStackSize, ringStackSize);
  ringLeft.backgroundImage = canvas.getImage();
  await ringContent(ringLeft, dataIcon, datafgColor, flowData.number, flowData.unit);
  ringStack.addSpacer();

  drawArc(voiceGap, voicefgColor, voicebgColor);
  const ringRight = ringStack.addStack();
  ringRight.layoutVertically();
  ringRight.size = new Size(ringStackSize, ringStackSize);
  ringRight.backgroundImage = canvas.getImage();
  await ringContent(
    ringRight,
    SFSymbol.named('phone.fill').image,
    voicefgColor,
    voiceData.number,
    voiceData.unit
  );
};

function sinDeg (deg) {
  return Math.sin((deg * Math.PI) / 180)
}

function cosDeg (deg) {
  return Math.cos((deg * Math.PI) / 180)
}

function ringContent (widget, icon, iconColor, text, unit) {
  const rowIcon = widget.addStack();
  rowIcon.addSpacer();
  const iconElement = rowIcon.addImage(icon);
  iconElement.tintColor = iconColor;
  iconElement.imageSize = new Size(12, 12);
  iconElement.imageOpacity = 0.7;
  rowIcon.addSpacer();

  widget.addSpacer(1);

  const rowText = widget.addStack();
  rowText.addSpacer();
  const textElement = rowText.addText(text);
  textElement.textColor = dataTextColor;
  textElement.font = Font.mediumSystemFont(ringTextSize);
  rowText.addSpacer();

  const rowUnit = widget.addStack();
  rowUnit.addSpacer();
  const unitElement = rowUnit.addText(unit);
  unitElement.textColor = dataTextColor;
  unitElement.font = Font.boldSystemFont(8);
  unitElement.textOpacity = 0.5;
  rowUnit.addSpacer();
}

function drawArc (deg, fillColor, strokeColor) {
  const ctr = new Point(canvSize / 2, canvSize / 2);
  const bgx = ctr.x - canvRadius;
  const bgy = ctr.y - canvRadius;
  const bgd = 2 * canvRadius;
  const bgr = new Rect(bgx, bgy, bgd, bgd);

  canvas.setFillColor(fillColor);
  canvas.setStrokeColor(strokeColor);
  canvas.setLineWidth(canvWidth);
  canvas.strokeEllipse(bgr);

  for (let t = 0; t < deg; t++) {
    const rectX = ctr.x + canvRadius * sinDeg(t) - canvWidth / 2;
    const rectY = ctr.y - canvRadius * cosDeg(t) - canvWidth / 2;
    const rectR = new Rect(rectX, rectY, canvWidth, canvWidth);
    canvas.fillEllipse(rectR);
  }
}


/***********get  ml****************/
const get_mlData = async () => {
  const cachePath = files.joinPath(files.documentsDirectory(), 'ml-ank000');
  const headers = {
    'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 unicom{version:iphone_c@9.0500}'
  };
  const url = 'https://m.client.10010.com/servicequerybusiness/operationservice/queryOcsPackageFlowLeftContentRevisedInJune';
  //const url = 'http://192.168.1.7/june';
  const req = new Request(url);
  req.method = 'POST';
  req.headers = {
    ...headers,
    cookie: clientCookie
  };
  try {
    const data = await req.loadJSON();
    console.log('ml信息请求成功 => ');
    //console.log(data)
    
    return data
  } catch (e) {
    const data = JSON.parse(files.readString(cachePath));
    data._state = 'expired'; // 缓存的数据
    console.warn('=== 数据请求失败，使用缓存数据 ===');
    console.warn(e);
    return data
  }
};





const getData = async () => {
  const cachePath = files.joinPath(files.documentsDirectory(), 'Chinaunicom-anker0');
  const headers = {
    'User-Agent': 'ChinaUnicom.x CFNetwork iOS/15.2 unicom{version:iphone_c@9.0500}'
  };

  const url = 'https://m.client.10010.com/mobileserviceimportant/home/queryUserInfoSeven?version=iphone_c@9.0500&desmobiel=' + Tel + '&showType=0';
  const req = new Request(url);
  req.headers = {
    ...headers,
    cookie: clientCookie
  };
  try {
    // FIXME 联通已限制 IP 访问次数
    const data = await req.loadJSON();
    console.log('余额信息请求成功 => ');
    // console.log(data)
    if (data.code === 'Y') {
      data._state = 'approved'; // 正常通过请求
      files.writeString(cachePath, JSON.stringify(data));
    } else {
      throw data.message
    }
    if (data.signinState === '1') {
      // case '0'：已签到；'1'：未签到
      const url1 = 'https://act.10010.com/SigninApp/signin/daySign';
      const req1 = new Request(url1);
      req1.headers = {
        ...headers,
        cookie: Cookie,
        Host: 'act.10010.com'
      };
      try {
        const data1 = await req1.loadJSON();
        console.log('签到信息请求成功 => ');
        // console.log(data1)
        if (data1.status === '0000' || (data1.msg || '').includes('已经签到')) {
          data.signinState = '0';
        } else {
          throw data1.msg
        }
      } catch (e) {
        console.warn('=== 签到失败 ===');
        console.warn(e);
        data._state = 'signin_failed'; // 签到失败的
      }
    }
    return data
  } catch (e) {
    const data = JSON.parse(files.readString(cachePath));
    data._state = 'expired'; // 缓存的数据
    console.warn('=== 数据请求失败，使用缓存数据 ===');
    console.warn(e);
    return data
  }
};

await main();
