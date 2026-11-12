// 在这里修改你想要伪装的 User-Agent
const PAD_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 MicroMessenger/8.0.49.2001 NetType/WIFI WindowsWechat";

// 修改请求头中的 User-Agent
if ($request && $request.headers) {
    $request.headers["User-Agent"] = PAD_UA;
    $request.headers["Referer"] = "https://mp.weixin.qq.com/";
    $request.headers["Accept-Language"] = "zh-CN,zh;q=0.9";
}

// 返回修改后的请求
$done({});