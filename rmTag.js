
let body = $response.body;

function removeScripts(html) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  doc.querySelectorAll('script').forEach(script => script.remove());
  return doc.documentElement.outerHTML;
}

let cleanHtml = removeScripts(body);

cleanHtml = cleanHtml.replace("<head>","<head><script>(function(){ var window.cgiData = null;window.adIframeUrl=null;window.ad_keywords=[];alert("Hello")})();</script>")


$done({cleanHtml});



