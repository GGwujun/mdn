import utils from '../util/utils';
import net from '../net/net';
import _pager from '../pagepager/index.js';

const REFRESH_CMLIST_CLASS = 'minirefresh-wrap';
const REFRESH_SCROLL_CLASS = 'minirefresh-scroll';

class pageData {
	constructor(el, handle) {
		this.init(el, handle)
	}
	init(el, handle) {
		var that = this;
		if (!el._page)
			el._page = el._conf.page;
		this.remoteData(el, function (data) {
			var rows = data.data || data;
			if (el._conf.code == 'search') {
				var searchs = []
				for (var key in rows) {
					if (rows.hasOwnProperty(key)) {
						var element = rows[key];
						if (key != 'filt' && key != 'custom') {
							element.forEach(function (item, index) {
								searchs.push({
									class_name: item.class_name,
									id: item.id,
									ismore: item.ismore,
									name: item.name,
									sub_cat: item.sub_cat
								})
							});
						}
					}
				}
				rows = searchs;
			}

			if (el._conf.code == 'filt') {
				var filts = []
				for (var key in rows) {
					if (rows.hasOwnProperty(key)) {
						var element = rows[key];
						if (key == 'filt') {
							element.forEach(function (item, index) {
								filts.push({
									filt_title: item.name,
									filt_class: item.class_name,
									filt_type: item.type
								})
							});
						}
					}
				}
				rows = filts;
			}

			if (el._conf.index) {
				var indexs = [];
				for (var key in rows) {
					if (rows.hasOwnProperty(key)) {
						var element = rows[key];
						if (element.name) {
							var _name = $.ConvertPinyin($.trim(element.name));
							var _M = _name.substr(0, 1)
							var ret = indexs.find(function (item) {
								return item.key == _M
							})
							if (!ret) {
								indexs.push({ key: _M, value: [element] });
							} else {
								ret.value.push(element);
							}
						}
					}
				}

				indexs = indexs.sort(function (a, b) {
					if (a.key > b.key) {
						return 1
					} else if (a.key < b.key) {
						return -1;
					} else {
						return 0;
					}
				})

				rows = indexs;
			}

			if (el._conf.three) {
				var threes = [];
				for (var key in rows) {
					if (rows.hasOwnProperty(key)) {
						var element = rows[key];
						if (!element[el._conf.three]) {
							element.children = [];
							threes.push(element);
						} else {
							var ret4
							var ret3 = threes.find(function (item) {
								ret4 = item.children.find(function (data) {
									return data[el._conf.three] == element[el._conf.three];
								})
							})
							var ret2 = threes.find(function (item) {
								return item.id == element[el._conf.three];
							})

							if (ret2) {
								element.children = [];
								ret2.children.push(element)
							}

							if (ret4) {
								ret4.children.push(element)
							}
						}
					}
				}
				rows = threes;
			}
			el._data = rows;
			el._maxTotal = data.total;
			el._datajson = data;
			if (el._page && el._conf.cou) {
				if (!el._conf.infinite) {
					if (!$(el).hasClass(`${REFRESH_CMLIST_CLASS}`))
						$(el).addClass(`${REFRESH_CMLIST_CLASS}`);
					if ($(el).children().attr('cm-data')) {
						let _cmdata = $(el).html();
						_cmdata = `<div class="${REFRESH_CMLIST_CLASS}">${_cmdata}</div>`;
						$(el).html(_cmdata);
					} else if (!$(el).find('[cm-data]').parent().hasClass(`${REFRESH_SCROLL_CLASS}`))
						$(el).find('[cm-data]').parent().addClass(`${REFRESH_SCROLL_CLASS}`);
				}
				new _pager(el, data);
			} else {
				(!$(el).find('[cm-data]').length) && el._conf.callback && el._conf.callback(el._datajson)
			}
			handle(rows);
		});
	}

	remoteData(el, handle) {
		if (el._conf.data) {
			handle && handle(el._conf.data);
		} else {
			var code = el._conf.flag; //data协议就会有flag
			var defa = el._conf.defa;
			var flt = el._conf.flt ? el._conf.flt : (defa ? {} : null);
			if (defa) {
				for (var key in defa) {
					flt[key] = utils.replaceQuery(defa[key]);
				}
			}

			var remote = {};

			if (code) {
				remote.cmd = "list";
				remote.name = code;
				remote.list = el._conf.list;
			}
			remote.page = el._page ? el._page : 1; //页面从1开始
			remote.cou = el._conf.cou == undefined ? 1 : el._conf.cou;
			remote.sort = el._conf.sort ? el._conf.sort : '';
			remote.ord = el._conf.ord ? el._conf.ord : '';

			if (el._conf.ent == true)
				remote.ent = 1;
			if (el._conf._memb)
				remote._memb = el._conf._memb;
			if (el._conf.param) {
				for (var key in el._conf.param) {
					remote[key] = el._conf.param[key];
				}
			}
			var param = {
				type: 'post',
				masked: true,
				local: el._conf.local,
				dataType: 'json'
			};
			if (code) {
				param.cmd = 'data';
			} else if (el._conf.cmd && !el._conf.url) {
				param.cmd = el._conf.cmd;
				remote._flag = el._conf.code;
				remote._memb = el._conf.list;
				remote.cmd = 'list';
			} else {
				param.url = el._conf.url;
				param.type = el._conf.type ? el._conf.type : "post"
				for (var key in el._conf) {
					if (el._conf.hasOwnProperty(key) && key != 'url' && key != 'type') {
						var element = el._conf[key];
						remote[key] = element;
					}
				}
			}

			if (flt) {
				var fltJson = flt;
				flt = '<Filter xmlns="filter"><Row>';
				for (var key in fltJson) {
					var obj = fltJson[key];
					var t = 1;
					var v = '';
					if (typeof obj == "object") {
						v = obj.value.toString();
						t = obj.type;
					} else
						v = obj.toString();

					v = utils.replaceQuery(v, el);

					flt += '<Data Type="' + t + '" Value="' + v + '">' + key + '</Data>';
				}
				flt += '</Row></Filter>';
				if (flt == '<Filter xmlns="filter"><Row></Row></Filter>')
					flt = '';
			}
			remote.flt = flt;

			if (el._conf.detail) {
				remote.cmd = 'data_v2';
				remote.priTab = el._conf.code;
				remote.depTab = el._conf.detail;
				remote.lid = el._conf.three;
				delete remote['name'];
			}

			param.data = remote;
			param.callback = function (data) {
				if (data.success || typeof (data) === 'object') {
					handle && handle(data);
				} else {
					utils.error(net.getErrorMessage(data));
				}
			}
			param.error = function () {
				utils.error('The data ' + (remote.name ? remote.name : remote._flag) + '  load fails！ ')
			}
			net.ajax(param);
		}
	}
}

export default pageData