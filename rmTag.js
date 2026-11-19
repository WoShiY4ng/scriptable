
let body = $response.body;

function removeScripts(html) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  doc.querySelectorAll('script').forEach(script => script.remove());
  return doc.documentElement.outerHTML;
}

const cleanHtml = removeScripts(body);



$done({cleanHtml});