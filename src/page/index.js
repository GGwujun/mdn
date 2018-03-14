import utils from '../util/utils';
import net from '../net/net';
import pageData from '../pagedata/pagedata.js';
import action from '../action/index.js';
import router from '../router/router.js';
import ent from '../ent/ent.js';
import pageTemplate from '../template/template.js';
import app from '../cordova/index.js';
import makeState from '../state/state.js';


// window.app = app;

function initWeiXin(handle) {
	if (utils.isWeiXin()) {
		wx.config(wxconf);
		wx.ready(handle);
	}
	else
		handle();
}

function initElem(el, inited, handle) {
	var list = $(el).attr('cm-list');

	if (!el._conf)
		el._conf = utils.StrToJson(list);

	if (inited) {
		el._inited = true;
	}

	if (el._conf.target)
		el._html = $(el._conf.target).html();

	if (el._inited || el._conf.inited !== false) {
		el._inited = null;
		new pageData(el, function () {
			//只有cm-list成功取到数据才会执行这个回调，初始化action，ent，cm-to
			function Init_list(el) {
				action.init($(el), true);
				//page.moveToTarget($(el));
				page.ent.init($(el), true, true);
			}

			new pageTemplate(el);

			Init_list(el);
			page.inx++;
			handle && handle(el);
		})
	} else {
		page.inx++;
		handle && handle(el);
	}
}

function refresh(el, inited, handle, cmlist) {
	if (cmlist) {
		$.hideloading();
		$.showloading('loading-b');
	}

	initElem(el, inited, function (that) {
		$.hideloading();
		$(that).show();
		if (page.inx == page.list_Num) {
			handle && handle(that);
		}
	})
}



const page = {
	conf: function (el, conf) {
		if (conf) {
			if (!el._conf)
				el._conf = utils.StrToJson($(el).attr('cm-list'));
			for (var key in conf) {
				el._conf[key] = conf[key];
			}
		}
	},
	reload: function (el, handle, cmlist = true, isSearch = false, inited = true, page_inex, ) {
		page.list_Num = $(el).find('[cm-list]').length ? $(el).find('[cm-list]').length : 1;
		page.inx = 0;
		if (isSearch) {
			el.search = true;
			el.pageRefresh.triggerDownLoading(true);
			setTimeout(function () {
				handle && handle();
			}, 500);

		} else {
			if ($(el).attr('cm-list')) {
				if (page_inex == '-1') {//只刷新当前页
					refresh(el, inited, handle, cmlist);
				} else {
					el._page = page_inex;
					refresh(el, inited, handle, cmlist);
				}
			} else if (page.list_Num) {
				$(el).find('[cm-list]').each(function () {
					refresh(this, false, handle, cmlist);
				});
			}

			if ($(el).find('[cm-action]').length) {
				action.init($(el), true, handle);
			}

			if ($(el).find('[cm-auth]').length) {
				$(el).on('click', '[cm-auth]', function () {
					makeState($(this));
				})
			}
		}
	},
	defa: function (el, defa) {
		if (defa) {
			for (var key in defa) {
				el._conf.defa[key] = utils.replaceQuery(defa[key]);
			}
		}
	},
	moveToTarget: function (el) {
		el.find('[cm-to]').each(function () {
			var nid = $(this).attr('cm-to');
			var _to = $(nid);
			if (_to.length === 1)
				_to.html('');
			$(this).appendTo(_to);
		})
	},
	initList: function (handle) {
		moveList();
		var len = $('[cm-list]').length;
		if (len > 0) {
			for (var i = 0; i < len; i++) {
				initElem($('[cm-list]').get(i), false, function (that) {
					if (inx == len) {
						handle && handle(that);
					}
				}, i);
			}
		} else {
			handle && handle();
		}
	},

	ready: function (callback, jss) {
		var pagePaths = [];
		utils.plugins();
		if (page._ready) {
			if (jss) {
				utils.loadJSS(jss, callback)
			} else
				callback && callback();
			return;
		}
		page._ready = true;

		if (utils.isWeiXin()) {
			$('body').addClass('paltform_wechat')
			/**
			 * 微信打开的页面
			 */
			pagePaths.push("/csb/weixin/?id=" + location.pathname)
			pagePaths.push("https://res.wx.qq.com/open/js/jweixin-1.2.0.js");
			if (window.history && window.history.pushState) {
				window.addEventListener("popstate", function (e) {
					var nobackArray = $('head').attr('noback') ? $('head').attr('noback').split(',') : [];
					var page_currentid = $('.page.page-current').attr('id');
					var isBack = true;
					for (var i = 0; i < nobackArray.length; i++) {
						if (nobackArray[i] === page_currentid) {
							isBack = false;
						}
					}
					if (!isBack) {
						window.history.forward(0);
					}
				}, false);
			}

		} else if (utils.isbrowser()) {
			/**
			 * app打开的页面
			 */
			var device;
			var ua = navigator.userAgent;
			var android = ua.match(/(Android);?[\s\/]+([\d.]+)?/);
			var ipad = ua.match(/(iPad).*OS\s([\d_]+)/);
			var ipod = ua.match(/(iPod)(.*OS\s([\d_]+))?/);
			var iphone = !ipad && ua.match(/(iPhone\sOS)\s([\d_]+)/);
			if (android) device = 'paltform_android';
			if (ipad) device = 'paltform_ipad';
			if (ipod) device = 'paltform_ipod';
			if (iphone) device = 'paltform_ios';
			$('body').addClass(device)
			pagePaths.push('cordova.js');
			utils.cordova = true;
		} else {
			/**
			 * 手机浏览器打开的页面
			 */
			$('body').addClass('paltform_brower')
		}

		if (jss) {
			for (var i = 0; i < jss.length; i++)
				pagePaths.push(jss[i]);
		}



		function _ready(paths, handle) {
			// if (utils.isWeiXin()) {
			// 	net.ajax({
			// 		url: "/csb/weixin/?id=" + location.pathname,
			// 		type: 'get',
			// 		callback: function () {
			// 			if (paths.length) {
			// 				utils.loadJSS(paths, function () {
			// 					handle && handle(utils);
			// 				}, function (url) {
			// 					throw Error('The load ' + (url) + ' fails,check the url！ ')
			// 				}, 'utils');
			// 			} else {
			// 				handle && handle(utils);
			// 			}
			// 		}
			// 	});
			// } else {
			if (paths.length) {
				utils.loadJSS(paths, function () {
					handle && handle(utils);
				}, function (url) {
					throw Error('The load ' + (url) + ' fails,check the url！ ')
				}, 'utils');
			} else {
				handle && handle(utils);
			}
			// }
		}

		_ready(pagePaths, function () {
			$.init();
			$.routerInit();
			if (utils.cordova)
				app.initialize();
			action.ready(function () {
				initWeiXin(function () {
					router.init();
					window.router = router;
					if (!utils.cordova)
						$.router.defaults.transition = false;
					action.initAction();
					callback && callback();
				})
			})
		}, 'utils');
	}
}

export default page