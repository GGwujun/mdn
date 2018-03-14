

import utils from '../util/utils';

const checkImg = Symbol('checkImg');



class pageTemplate {
	/**
	 * 
	 * @param {*element} el cm-list所在的dom对象
	 * @param {*Object} data 
	 */
	constructor(el, data) {
		this.init(el, data);
	}

	/**
	 * 
	 * @param {*element} el cm-list所在的dom对象
	 * @param {*Object} data 
	 */
	init(el, data) {
		let self = this;
		if (data) {
			el._data = data;
		} else if (el._data) {
			data = el._data;
		}



		if (!el._vue) {
			el._vue = new Vue({
				el: $(el).find('[cm-data]').get(0),
				mixins: [el._conf.mixin ? el._conf.mixin : {}],
				data: {
					list: data
				},
				methods: {
					nextTick: function (el) {
						this.$nextTick(function () {
							$(el).css('visibility', 'visible');
							self[checkImg]($(el)[0]);
							el._conf.callback && el._conf.callback(el._datajson);
							$(el).attr('_inited', true);
						});
					},
					addVal: function (data) {
						for (var i = 0; i < data.length; i++)
							this.list.push(data[i]);
						el.imgInx = this.list.length;
						this.nextTick(el)
					},
					refresh: function (data) {
						this.list = [];
						el.imgInx = 0;
						for (var i = 0; i < data.length; i++)
							this.list.push(data[i]);
						this.nextTick(el)
					}
				},
				mounted: function () {
					this.nextTick(el);
				}
			});
		}
		else if (el._page > 1) {
			el._vue.addVal(data);
		} else {
			$(el).find('[cm-data]').length && el._vue.refresh(data);
		}
	}

	/**
	 * 
	 * @param {*element} obj 
	 */

	[checkImg](obj) {
		//判断浏览器
		var Browser = new Object();
		Browser.userAgent = window.navigator.userAgent.toLowerCase();
		Browser.ie = /msie/.test(Browser.userAgent);
		Browser.Moz = /gecko/.test(Browser.userAgent);

		//判断是否加载完成
		function Imagess(url, imgid, callback) {
			const UPLOADS_STR = '/csb/uploads/';
			if (url.indexOf(`${UPLOADS_STR}`) >= 0) {
				var val = url.indexOf('http') >= 0 ? url : `${utils.getDomian()}${url}`;
			} else {
				var val = url.indexOf('http') >= 0 ? url : `${utils.getDomian()}${UPLOADS_STR}${url}`;
			}

			var img = new Image();
			if (Browser.ie) {
				img.onreadystatechange = function () {
					if (img.readyState == "complete" || img.readyState == "loaded") {
						callback(img, imgid);
					}
				}
			} else if (Browser.Moz) {
				img.onload = function () {
					if (img.complete == true) {
						callback(img, imgid);
					}
				}
			}
			//如果因为网络或图片的原因发生异常，则显示该图片
			img.onerror = function () {
				img.src = "https://cdn.csdu.net/images/failed.png"
			}
			img.src = val;
		}
		//显示图片
		function checkimg(img, imgid) {
			if ($(obj).find('#' + imgid).hasClass('imgLoading'))
				$(obj).find('#' + imgid).removeClass('imgLoading').attr('src', img.src);
		}

		//初始化需要显示的图片，并且指定显示的位置
		var imglist = $(obj).find('img').not('.isLoad');
		Imagess.imglist = imglist.length;
		if (imglist.length) {
			for (var i = obj.imgInx ? obj.imgInx : 0; i < imglist.length; i++) {
				imglist[i].id = "img0" + i;
				$(imglist[i]).addClass('imgLoading isLoad');
				$(imglist[i]).attr('src-path', imglist[i].getAttribute("src"));
				$(imglist[i]).attr('src', 'https://cdn.csdu.net/images/img_loading.gif');
				Imagess(imglist[i].getAttribute("src-path"), imglist[i].id, checkimg);
			}
		}
	}
}

export default pageTemplate

