import utils from '../util/utils.js';
import pagerefresh from 'pagerefresh';
import 'pagerefresh/dist/debug/pagerefresh.css';

function initRefresh(el, maxItems, cou) {
	var uplock = el._conf.uprefresh === false ? true : false;
	var downlock = el._conf.downrefresh === false ? true : false;
	var ifBody = $(el).hasClass('contacts-block') ? true : false;
	const _refreshTheme = $('head').attr('pagerefresh') ? $('head').attr('pagerefresh') : 'defaults';
	if (!el.pageRefresh) {
		el.pageRefresh = new pagerefresh({
			container: '#' + $(el).attr('id'),
			theme: el._conf.refresh ? el._conf.refresh : _refreshTheme,
			isUseBodyScroll: ifBody,
			down: {
				isLock: downlock,
				callback: function () {
					el._conf.page = 1;
					if (el._maxTotal)
						maxItems = el._maxTotal
					page.reload(el, function () {
						setTimeout(function () {
							el.pageRefresh.endDownLoading(true);
							//判断满屏
							let scrollHeight = el.pageRefresh.scrollWrap.scrollHeight,
								clientHeight = utils.getClientHeightByDom(el.pageRefresh.scrollWrap)
							if (scrollHeight > clientHeight) {
								// alert('这个是已经满屏了，需要重置')
								el.filted = false;
							}
							el.pageRefresh.endUpLoading(el._page * cou > maxItems);
						});
					}, false);
				}
			},
			up: {
				isLock: uplock,
				loadFull: { isEnable: true },
				callback: function () {
					// alert('进到up')
					if (el._maxTotal)
						maxItems = el._maxTotal
					el._page++;
					page.list_Num = 1;
					page.reload(el, function () {
						el.filted = false;
						el.pageRefresh.endUpLoading(el._page >= Math.ceil(maxItems / cou) ? true : false);
					}, false, false, true, el._page);
				},
				contentnomore:'我是有底线的'
			}
		})
	}
}


class pager {
	constructor(el, data) {
		this.init(el, data);
	}

	/**
	 * cm-list下拉刷新，上拉加载
	 * @param {*} el cm-list所在dom
	 * @param {*} data cm-list所在返回数据
	 * @author dsx
	 */
	init(el, _data) {
		var _conf = el._conf;
		var self = el;
		if (!el.itemsPerLoad)
			el.itemsPerLoad = 1;
		var maxItems = _data.total ? _data.total : 2;
		var cou = self._conf.cou;
		if (_conf.infinite) {
			if (el.itemsPerLoad >= Math.ceil(maxItems / cou)) {
				$(el).find(_conf.infinite).text('已没有更多数据').removeClass(_conf.infinite.substring(1)).addClass('nomore');
			} else {
				$(el).find('.nomore').text('加载更多数据').removeClass('nomore').addClass(_conf.infinite.substring(1));
				$(el).find(_conf.infinite).click(function () {
					var $this = this;
					$(this).unbind('click');
					$(this).addClass('loading')
					el.itemsPerLoad++;
					if (el.itemsPerLoad <= Math.ceil(maxItems / cou)) {
						self._conf.page = el.itemsPerLoad;
						self._page = el.itemsPerLoad;
						page.reload(el, function () {
							$($this).removeClass('loading');
						}, false, true, self._page);
					} else {
						$(this).text('已没有更多数据').removeClass().addClass('nomore');
					}
				});
			}
		} else
			initRefresh(el, maxItems, cou);
	}
}

var _pager = pager;
export default _pager


