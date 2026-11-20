
/*
 * Shadowrocket（小火箭）HTTP-Request 脚本
 * 作用：伪装浏览器请求微信文章 + 绕过图片防盗链
 *
 * 【配置】追加到小火箭配置：
 * [Script]
 * WXRequest = type=http-request,pattern=^https?://(mp\.weixin\.qq\.com|mmbiz\.qpic\.cn|mmbizurl\.cn)/,script-path=local/fetch-weixin-request-shadowrocket.js
 * [MITM]
 * hostname = mp.weixin.qq.com, mmbiz.qpic.cn, mmbizurl.cn
 *
 * 【说明】
 * - 文章页：伪装桌面 Chrome UA（移动端 UA 会被微信 302 到验证/精简页），
 *   并删除 Accept-Encoding，让服务器返回未压缩 HTML，供响应脚本安全改写。
 * - 图片域：删除 Referer。实测微信图片"无 Referer"返回正常大图，"错误 Referer"只返回 2KB 提示图。
 * - 必须开启 MITM 并信任证书；MITM 只对你拥有的流量使用。
 */
(function () {
  var req = (typeof $request !== 'undefined') ? $request : null;
  if (!req || !req.headers) { $done(); return; }

  var headers = req.headers;
  var url = req.url || '';
  var isArticle = /^https?:\/\/mp\.weixin\.qq\.com\//i.test(url);
  var isImage = /^https?:\/\/(mmbiz\.qpic\.cn|mmbizurl\.cn|mmbiz\.gstatic\.com)\//i.test(url);

  if (isArticle) {
    headers['User-Agent'] =
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
      '(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
    headers['Accept'] = 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8';
    headers['Accept-Language'] = 'zh-CN,zh;q=0.9,en;q=0.8';
    // 删除压缩协商，避免响应体是 gzip/br 导致响应脚本改不动
    delete headers['Accept-Encoding'];
    delete headers['accept-encoding'];
  } else if (isImage) {
    // 防盗链：无 Referer 拿到正常图；错误 Referer 拿到 2KB 提示图
    delete headers['Referer'];
    delete headers['referer'];
  } else {
    $done();
    return;
  }

  $done({ headers: headers });
})();
