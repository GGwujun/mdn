import utils from '../util/utils';


const router = {
	init: function () {
		$('.page').on('pageInit', function (e, pageId, $page) { //新页面加载回调
			if (!$page.hasClass('page-top'))
				router.pageLoad($page, pageId, true);
			if (!$page.attr('data-nav') || $page.attr('data-nav') == "false") {
				$('nav').hide();
			} else {
				$('nav').show();
				$('nav').find('a').removeClass('active');
				$('nav').find('a[href="#' + pageId + '"]').addClass('active');
			}
		});

		$('.page').on('pageReinit', function (e, pageId, $page) {  //旧页面回调
			if (pageId) {
				var el = $('#' + pageId).get(0);
				if (!$(el).attr('data-nav') || $(el).attr('data-nav') == "false") {
					$('nav').hide();
				} else {
					$('nav').show();
				}
			}

			if ($page[0].savereload) {
				router.pageLoad($page, pageId, true);
				$page[0].savereload = false;
			}

			if ($page.attr('data-reload')) {
				//page.reload($page[0], null, false);
				//router.pageLoad($page, pageId, true);
				var  el = $('#' + pageId).get(0)
				el.onload && el.onload();
			}
		});

		$('body').delegate('a[param]', 'click', function (e) {
			var param = utils.StrToJson($(this).attr('param'));
			var goPage = $(this).attr('href');
			
			if ($(this).hasClass("back")) {
                return;
            }
			
            if (!goPage || goPage === "#" || /javascript:.*;/.test(goPage)) return;
			
			var data_title = $(this).attr('data-title');
			if (data_title)
				$(goPage).attr('data-title', data_title);
			for (var key in param) {
				utils.global[key] = param[key];
				if ($(goPage)[0]) {
					if ($(goPage)[0].params) {
						$(goPage)[0].params[key] = param[key];
					} else {
						$(goPage)[0].params = {};
						$(goPage)[0].params[key] = param[key];
					}
				}
			}
			var pages = $(this).attr('href');
			if ($(pages).find('[cm-list]').length) {
				for (var i = 0; i < $(pages).find('[cm-list]').length; i++) {
					var cm = $(pages).find('[cm-list]').eq(i);
					if (cm[0]._conf) {
						cm[0]._conf.param = {}
						for (var key in param) {
							cm[0]._conf.param[key] = param[key];
						}
					}
				}
			}
			if ($(pages).length && $(pages).hasClass('page-inited') && !$(page).attr('page-iscache') && !$(page).attr('data-reload'))
				router.pageLoad(null, pages.split('#')[1], true);
		});
		if (location.hash) {
			$('.page').removeClass('page-inited');
			$('.page.page-current').removeClass('page-current');
			var _page = $('.page' + location.hash);
			_page.addClass('page-current');
			_page.addClass('page-top');
			router.pageLoad(null, document.querySelector('.page-current').id, true);
		} else {
			$('.page-current').addClass('page-top');
			router.pageLoad(null, document.querySelector('.page-current').id, true);
			$('.page.preload').each(function () {
				if (!$(this).hasClass('page-current'))
					router.pageLoad(null, this.id, true);
			})
		}
	},
	pageLoad: function ($page, pageId, refresh, noOnload) {
		let self = this;
		if (!pageId) {
			pageId = $('.page.page-current').attr('id');
		}

		if (pageId) {
			var el = $('#' + pageId).get(0);
			/**
			 * 设置单个页面的状态栏颜色
			 */
			// if (window.app) {
			// 	var statusBg = $(el).attr('statusBg');
			// 	if (statusBg)
			// 		StatusBar.backgroundColorByHexString(statusBg);

			// 	/**
			// 	 * dark text, for light backgrounds
			// 	 */
			// 	// StatusBar.styleDefault();
			// 	StatusBar.styleBlackTranslucent();
			// 	/**
			// 	 * light text, for dark backgrounds
			// 	 */
			// 	// StatusBar.styleBlackOpaque();
			// }

			if ($(el).hasClass('page-current')) {
				if (!$(el).attr('data-nav') || $(el).attr('data-nav') == "false") {
					$('nav').hide();
				} else {
					$('nav').show();
					$('nav').find('a').removeClass('active');
					$('nav').find('a[href="#' + pageId + '"]').addClass('active');
				}
			}
			if (!el._init || refresh) {
				var path = location.pathname;
				if ($('head').attr('path')) {
					path = '/' + $('head').attr('path');
				} else {
					path = path.substring(0, path.lastIndexOf('/'));
				}
				var pageName = $(el).attr('id');
				var oldHtml = $.data(el, 'html');
				el._init = true;
				if (!oldHtml) {
					var $file = $('<div cm-action-file-open></div>').appendTo($('body'));
					setTimeout(function () {
						$file.get(0)._conf = {
							url: path + '/template/' + pageId + '.html', callback: function (html) {
								if (html) {
									if (html.indexOf('function onload()') > 0) {
										var uuid = 'f' + utils.uuid() + '()';
										html = html.replace('function onload()', 'function ' + uuid);
										el._onload = uuid;
										$(el).attr('onload', uuid);
									}
									if (utils.isWeiXin()) {
										html = html.replace('bar-nav', 'hide').replace('head-bar', 'hide');
									}
									$.data(el, 'html', html);
									$(el).html(html);
									if (refresh) {
										if (!noOnload)
											el.onload && el.onload();
									}
								}
							}
						};
						$file.click().remove();
					}, 100);
				}
				else {
					$(el).html(oldHtml);
					if (!noOnload)
						el.onload && el.onload();
				}
			} else {
				if (!noOnload)
					el.onload && el.onload();
			}

			if ($('#' + pageId).attr('data-title')) {
				$($('#' + pageId).find('header h1.title').get(0)).text($('#' + pageId).attr('data-title'));
			}
		}
	}

}
export default router