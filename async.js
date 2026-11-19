let body = $response.body;

if(body.indexOf('isNeedAd: e,') !== -1){
	body = body.replace('isNeedAd: e,','isNeedAd: 0,')
};

if(body.indexOf('is_need_ad: s') !== -1){
	body = body.replace('is_need_ad: s','is_need_ad: 0')
};
if(body.indexOf('adInfo: t') !== -1){
	body = body.replace('adInfo: t','adInfo: null')
};


$done({body});