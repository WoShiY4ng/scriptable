/*
 * Shadowrocket（小火箭）HTTP-Response 脚本 —— 二合一版
 * 一次响应内同时做两件事：
 *   A. 修图片显示：data-src→src、显示 js_content 容器、referrer 改 no-referrer、http 图片升 https
 *   B. 纯净快照：删除所有 script、on* 事件、javascript: 伪协议、滚动相关 CSS
 *
 * 【配置】追加到小火箭配置：
 * [Script]
 * WeixinAllInOne = type=http-response,pattern=^https?://mp\.weixin\.qq\.com/s/,script-path=local/weixin-all-in-one-shadowrocket.js,requires-body=1,max-size=0,timeout=30
 * [MITM]
 * hostname = mp.weixin.qq.com
 *
 * 【配合】建议同时挂请求脚本 fetch-weixin-request-shadowrocket.js
 *   （删 Accept-Encoding 拿未压缩 HTML + 删图片 Referer 防盗链）
 *
 * 【执行顺序】先 B（删脚本得到干净静态 DOM），再 A（修图片属性）。
 *   先删脚本可避免脚本模板字符串里的 data-src 被误改。
 *
 * 注意：必须开启 MITM 并信任证书；MITM 只对你拥有的流量使用。
 *
 * 【弹框通知】每次脚本真正改写文章时会发一条 iOS 系统通知（横幅）。
 *   开关 ENABLE_NOTIFY 设为 false 可关闭。
 *   前提：iOS 设置 → 通知 → Shadowrocket 需允许通知，否则横幅不弹。
 */

// ===== 弹框通知开关 =====
var ENABLE_NOTIFY = true;

// 兼容不同内核的通知接口：$notify（社区通用）/ $notification.post（Surge 系）
function notify(title, subtitle, body) {
  if (!ENABLE_NOTIFY) return;
  try {
    if (typeof $notify === 'function') {
      $notify(title, subtitle || '', body || '');
    } else if (typeof $notification !== 'undefined' && typeof $notification.post === 'function') {
      $notification.post(title, subtitle || '', body || '');
    }
  } catch (e) {}
}

// 从 HTML 提取文章标题，用于通知内容
function extractTitle(html) {
  var m = html.match(/<meta property="og:title" content="([^"]*)"/);
  return m ? m[1] : '（标题未知）';
}

/* ============ B. 纯净快照：清洗 HTML ============ */

var SCROLL_CSS_PROPS = [
  'overflow', 'overflow-x', 'overflow-y',
  'overscroll-behavior', 'overscroll-behavior-x', 'overscroll-behavior-y',
  'scroll-behavior', 'touch-action'
];

function stripScrollCss(css) {
  if (!css) return '';
  var pattern = new RegExp(
    '(^|;|\\{)\\s*(' + SCROLL_CSS_PROPS.join('|') + ')\\s*:\\s*[^;}]*',
    'gi'
  );
  return String(css)
    .replace(pattern, '$1')
    .replace(/;\s*;/g, ';')
    .replace(/^\s*;\s*/, '')
    .replace(/\{\s*;/g, '{')
    .trim();
}

function cleanHtml(html) {
  var eventPattern = /\son[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi;
  return String(html)
    // 删所有 script：先自闭合、再配对，用带引号感知的正则避免属性里含 > 时误切
    .replace(/<script\b(?:[^>"']|"[^"]*"|'[^']*')*\/>/gi, '')
    .replace(/<script\b(?:[^>"']|"[^"]*"|'[^']*')*>[\s\S]*?<\/script\s*>/gi, '')
    // 删 on* 事件属性
    .replace(eventPattern, '')
    // 清 javascript: 伪协议
    .replace(/\b(href|src|action|formaction)\s*=\s*(["'])\s*javascript:[\s\S]*?\2/gi, '$1="#"')
    // 清 style 属性里的滚动 CSS（带引号）
    .replace(/\sstyle\s*=\s*(["'])([\s\S]*?)\1/gi, function (_, quote, css) {
      var cleaned = stripScrollCss(css);
      return cleaned ? ' style=' + quote + cleaned + quote : '';
    })
    // 无引号 style 属性
    .replace(/\sstyle\s*=\s*(?!["'])([^\s>]+)/gi, function (_, css) {
      var cleaned = stripScrollCss(css);
      return cleaned ? ' style="' + cleaned + '"' : '';
    })
    // 清 <style> 块里的滚动 CSS
    .replace(/<style\b([^>]*)>([\s\S]*?)<\/style\s*>/gi, function (_, attrs, css) {
      return '<style' + attrs + '>' + stripScrollCss(css) + '</style>';
    });
}

/* ============ A. 修图片显示 ============ */

function fixImages(html) {
  // 1) 只在 js_content 区域内 data-src → src（此时脚本已删，剩余的都是真实 DOM）
  var start = html.indexOf('id="js_content"');
  if (start !== -1) {
    var head = html.slice(0, start);
    var body = html.slice(start);
    body = body.replace(/\sdata-src=/g, ' src=');
    html = head + body;
  }

  // 2) 让 js_content 容器可见
  var hidden = /id="js_content"[^>]*style="[^"]*(visibility:\s*hidden|opacity:\s*0)[^"]*"/;
  var m = html.match(hidden);
  if (m) {
    var fixedTag = m[0]
      .replace(/visibility:\s*hidden;?\s*/g, '')
      .replace(/opacity:\s*0;?\s*/g, '');
    html = html.replace(m[0], fixedTag);
  }

  // 3) referrer meta 覆盖为 no-referrer（防盗链）
  var refCount = (html.match(/<meta[^>]*name="referrer"[^>]*>/gi) || []).length;
  html = html.replace(
    /<meta[^>]*name="referrer"[^>]*>/gi,
    '<meta name="referrer" content="no-referrer">'
  );
  if (refCount === 0) {
    html = html.replace(/<\/head>/i, '<meta name="referrer" content="no-referrer">\n</head>');
  }

  // 4) http 图片升 https（避免混合内容拦截）
  html = html.replace(/http:\/\/mmbiz\.qpic\.cn/g, 'https://mmbiz.qpic.cn');

  return html;
}

/* ============ 主流程 ============ */

(function main() {
  if (typeof $response === 'undefined' || !$response) {
    $done();
    return;
  }

  var body = $response.body || '';
  var headers = $response.headers || {};

  var ctype = (headers['Content-Type'] || headers['content-type'] || '').toLowerCase();
  if (ctype.indexOf('html') === -1 || body.indexOf('js_content') === -1) {
    $done();
    return;
  }

  // 先清洗（删脚本），再修图片
  var out = cleanHtml(body);
  out = fixImages(out);

  // body 变了，移除旧的长度与压缩头
  try {
    delete headers['Content-Length'];
    delete headers['content-length'];
    delete headers['Content-Encoding'];
    delete headers['content-encoding'];
  } catch (e) {}

  // 弹框通知：同一篇文章 30 秒内只提醒一次，避免刷新时反复横幅
  var title = extractTitle(out);
  var dedupKey = 'wx_notify_' + title;
  var last = 0;
  try {
    last = parseInt($persistentStore.read(dedupKey) || '0', 10) || 0;
  } catch (e) {}
  var now = Date.now();
  if (now - last > 30000) {
    notify('微信文章已优化', title, '图片已修复 · 脚本/广告已清理');
    try { $persistentStore.write(String(now), dedupKey); } catch (e) {}
  }

  $done({ body: out, headers: headers });
})();
