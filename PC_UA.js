//[Script]
// # 拦截公众号文章页响应，注入 PC UA 伪装脚本
// http-response ^https://mp\.weixin\.qq\.com/s\? requires-body=1,max-size=0,script-path=pc_ua.js

const PC_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 MicroMessenger/8.0.49.2001 NetType/WIFI WindowsWechat";

let body = $response.body || "";

// 构造注入脚本（放在页面最早执行，劫持后续所有 UA 检测）
const inject = `<script>
(function(){
  try {
    const fakeUA = "${PC_UA}";
    // 劫持 navigator.userAgent
    Object.defineProperty(navigator, 'userAgent', {
      get: function(){ return fakeUA; },
      set: function(){},
      configurable: true
    });
    // 劫持 navigator.platform
    Object.defineProperty(navigator, 'platform', {
      get: function(){ return 'Win32'; },
      configurable: true
    });
    // 预设全局标志位，覆盖页面中重复定义的 UA 检测变量
    window.__pc_ua_faked__ = true;
    window.is_pc = true;
    window.is_windows = true;
    window.is_wechat = true;
    window.is_windows_wechat = true;
    window.is_android = false;
    window.is_ios = false;
    window.is_harmony = false;
    window.is_mac = false;
    window.is_ipad = false;
    window.is_wp = false;
    window.is_linux = false;
    window.is_wx_work = false;
    window.is_in_miniProgram = false;
    window.is_donut_app = false;
    window.is_prefetch = false;
    window.is_unified_pc_wechat = false;
    window.is_harmony_pc = false;
    window.is_harmony_pc_wechat = false;
    window.is_pc_wechat = true;
    // 模拟微信环境变量接口，防止后续脚本读取失败
    if (!window.__wxWebEnv) {
      window.__wxWebEnv = {
        getEnv: function(){
          return JSON.stringify({
            platform: 'WindowsWechat',
            fontScale: 100,
            fontLevel: 2,
            enableAndroidEdge2Edge: false,
            immersiveMode: false,
            normalTopInset: 0,
            liquidGlassStatus: 0
          });
        },
        getLayoutScale: function(){ return 1; }
      };
    }
  } catch(e) {}
})();
</script>`;

// 优先注入到 </head> 之前；没有则注入到 <body> 之前；都没有则放在最前面
if (body.indexOf('</head>') !== -1) {
  body = body.replace('</head>', inject + '</head>');
} else if (body.indexOf('<body') !== -1) {
  body = body.replace('<body', inject + '<body');
} else {
  body = inject + body;
}

$response.body = body;
$done({});