/**
 *mcfee
 *网络交互
 *options
 * */

import *as CryptoJS from 'crypto-js';//MD5加密
import utils from '../util/utils.js';//MD5加密

function getConfig() {
	return $('head').attr('release') ? true : false;
}

function makeProtocol(url) {
	url = makeHosturl(url);
	if ('https:' == document.location.protocol) {
		return url.replace('http://', 'https://');
	}
	else
		return url;
};

function makeHosturl(url) {
	if (url.toLowerCase().indexOf('http') == 0) {

	} else {
		if (!utils.isPc() && !utils.isWeiXin() && $('head').attr('domain'))
			url = $('head').attr('domain') + url;
	}

	return url;
};

function MakeCSBURL(cmd) {
	if (cmd === 'admin')
		return '/admin/cod/';
	else if (cmd === 'cdn')
		return '/cdn/';
	else
		return getConfig() ? '/r/' : '/csb/' + cmd + '/';
};

function base64Data(txt) {
	var str = CryptoJS.enc.Utf8.parse(txt);
	var base64 = CryptoJS.enc.Base64.stringify(str);
	return base64;
};


const net = {
	Md5: function (txt) {
		return CryptoJS.MD5(txt).toString();
	},
	getErrorMessage: function (data) {
		return data.data ? data.data : (data.error ? data.error : (data.errors ? data.errors : '未知错误'));
	},
	ajax: function (param) {
		if (!param.url)
			param.url = MakeCSBURL(param.cmd);
		if (param.url) {
			param.url = makeProtocol(param.url);
			param.masked && utils.mask();
			var key;
			var cacheData;
			param.data = param.data ? param.data : {};
			if (param.local) {
				param.cache = true;
				key = net.Md5(param.url + JSON.stringify(param.data));
				cacheData = utils.StrToJson(window.localStorage.getItem(key));
			}

			if (param.encode && param.data && param.data.data) {
				param.data.data = base64Data(param.data.data);
			}
			if (cacheData) {
				param.masked && utils.unmask();
				param.callback && param.callback(cacheData);
			} else {
				setTimeout(function () {
					$.ajax({
						beforeSend: function (xhr) {
							xhr.setRequestHeader('tocken', 'default');
							// var sid = utils.getCache('HTTPSESSIONID');
							// if (!sid) {
							// 	var _sid = utils.uuid();
							// 	utils.setCache('HTTPSESSIONID', _sid)
							// 	xhr.setRequestHeader('HTTPSESSIONID', _sid)
							// } else
							// 	xhr.setRequestHeader('HTTPSESSIONID', sid)
						},
						url: param.url,
						async: param.async ? false : true,
						type: param.type,
						cache: param.cache ? true : false,
						dataType: param.dataType,
						data: param.data,
						complete: function (xhr) {
							param.masked && utils.unmask();
						},
						success: function (data, textStatus) {
							param.masked && utils.unmask();
							if (param.local) {
								window.localStorage.setItem(key, utils.JsonToStr(data))
							}
							param.callback && param.callback(data);
						},
						error: function (XMLHttpRequest, textStatus, errorThrown) {
							param.masked && utils.unmask();
							param.callback && param.callback('');
							if (param.error) {
								param.error(XMLHttpRequest, textStatus, errorThrown);
							}
							else {
								throw new Error(errorThrown);
							}
						}
					})
				}, 100);
			}
		}
	},
	send: function (param, complete, progress, error) { //异步提交FORM数据
		if (!param.url)
			param.url = MakeCSBURL(param.cmd);
		var xhr = new XMLHttpRequest();
		xhr.open("post", param.url, true);
		xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
		xhr.upload.addEventListener("progress", function (e) {
			progress && progress(e);
		}, false);
		xhr.addEventListener("load", function (e) {
			complete && complete(e)
		}, false);
		xhr.send(param.formData);
	}

}

export default net;