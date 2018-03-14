import utils from '../util/utils';
import net from '../net/net';

function entget_back(data, evt) {
	if (evt.target && data.success) {
		if (utils._role) {
			var arr = utils._role;
			if (!evt.role) {
				var Role = $.inArray(String(arr.level), evt.role);
			}
			else
				var Role = 1;

			if (arr.level != -1) {
				if (Role != -1) {
					if (data.rows[0]) {
						for (var key in data.rows[0]) {
							if (key === 'me_' + evt.typ.type) {
								var values = data.rows[0][key] ? data.rows[0][key] : 0;
								if (data.rows.length > 0 && values >= evt.max) {
									if (evt.showTitle.type && evt.showTitle) {
										if (evt.callbacks) {
											$(evt.target).attr("cm-ent", "{type:" + evt.typ.type + ",cou:-1,to:'" + evt.memto + "',max:'" + evt.max + "',_state:'" + evt._state + "',comment:'" + evt.comment + "',eid:'" + evt.eid + "',name:'" + evt.tab + "',showTitle:" + utils.JsonToStr(evt.showTitle) + ",callbacks:" + utils.JsonToStr(evt.callbacks) + ",real_value:" + values + ",waiting:'" + evt.waiting + "',callback:" + evt.callbacks.reduce + " }");
										} else {
											$(evt.target).attr("cm-ent", "{type:" + evt.typ.type + ",cou:-1,to:'" + evt.memto + "',max:'" + evt.max + "',_state:'" + evt._state + "',comment:'" + evt.comment + "',eid:'" + evt.eid + "',name:'" + evt.tab + "',showTitle:" + utils.JsonToStr(evt.showTitle) + ",real_value:" + values + ",waiting:'" + evt.waiting + "' }");
										}
										if (evt.showTitle.type == 'text') {
											$(evt.target).text(evt.showTitle.reduce);
										} else if (evt.showTitle.type == 'class') {
											$(evt.target).addClass(evt.showTitle.reduce);
										}
										ent.init($(evt.target).parent());
									} else {
										if (evt.showTitle.center && values == 1) {
											$(evt.target).attr('disabled', 'disabled');
											$(evt.target).text(evt.showTitle.center);
										} else {
											$(evt.target).attr('disabled', 'disabled');
											if (evt.showTitle.reduce) {
												$(evt.target).text(evt.showTitle.reduce);
											}
										}
									}
								} else {
									if (evt.callbacks) {
										$(evt.target).attr("cm-ent", "{type:" + evt.typ.type + ",cou:1,to:'" + evt.memto + "',max:'" + evt.max + "',_state:'" + evt._state + "',comment:'" + evt.comment + "',eid:'" + evt.eid + "',name:'" + evt.tab + "',showTitle:" + utils.JsonToStr(evt.showTitle) + ",callbacks:" + utils.JsonToStr(evt.callbacks) + ",real_value:" + values + ",waiting:'" + evt.waiting + "',callback:" + evt.callbacks.add + " }");
									} else {
										$(evt.target).attr("cm-ent", "{type:" + evt.typ.type + ",cou:1,to:'" + evt.memto + "',max:'" + evt.max + "',_state:'" + evt._state + "',comment:'" + evt.comment + "',eid:'" + evt.eid + "',name:'" + evt.tab + "',showTitle:" + utils.JsonToStr(evt.showTitle) + ",real_value:" + values + ",waiting:'" + evt.waiting + "' }");
									}
									if (evt.showTitle.type == 'text') {
										$(evt.target).text(evt.showTitle.add);
									} else if (evt.showTitle.type == 'class') {
										$(evt.target).addClass(evt.showTitle.add);
									}
									ent.init($(evt.target).parent(), true);
								}
							}
						}
					} else {
						var values = 0;
						if (evt.callbacks) {
							$(evt.target).attr("cm-ent", "{type:" + evt.typ.type + ",cou:1,to:'" + evt.memto + "',max:'" + evt.max + "',_state:'" + evt._state + "',eid:'" + evt.eid + "',name:'" + evt.tab + "',showTitle:" + utils.JsonToStr(evt.showTitle) + ",callbacks:" + utils.JsonToStr(evt.callbacks) + ",real_value:" + values + ",waiting:'" + evt.waiting + "',callback:" + evt.callbacks.add + " }");
						} else {
							$(evt.target).attr("cm-ent", "{type:" + evt.typ.type + ",cou:1,to:'" + evt.memto + "',max:'" + evt.max + "',_state:'" + evt._state + "',comment:'" + evt.comment + "',eid:'" + evt.eid + "',name:'" + evt.tab + "',showTitle:" + utils.JsonToStr(evt.showTitle) + ",real_value:" + values + ",waiting:'" + evt.waiting + "' }");
						}
						if (evt.showTitle.type == 'text') {
							$(evt.target).text(evt.showTitle.add);
						} else if (evt.showTitle.type == 'class') {
							$(evt.target).addClass(evt.showTitle.add);
						}
						ent.init($(evt.target).parent(), false);
					}
				} else {
					$(evt.target).hide();
				}
			} else {
				$(evt.target).unbind('click').click(function () {
					$.toast('您需要登陆')
					$.router.loadPage((utils.isWeiXin() ? '#bind' : '#login'), true);
				})
			}
		} else {
			$(evt.target).unbind('click').click(function () {
				$.toast('您需要登陆')
				$.router.loadPage((utils.isWeiXin() ? '#bind' : '#login'), true);
			})
		}
	};

}

function entclick_back(obj, evt, data) {
	if (data.error) {
		$.toast(data.error);
	} else if (data.rows.length > 0) {
		var values = parseInt(evt.real_value) + parseInt(evt.cou);
		if (values >= evt.max) {
			if (evt.showTitle.type && evt.showTitle) {
				if (evt.callbacks) {
					$(obj).attr("cm-ent", "{type:" + evt.type + ",cou:-1,to:'" + evt.to + "',max:'" + evt.max + "',_state:'" + evt._state + "',eid:'" + evt.eid + "',name:'" + evt.name + "',showTitle:" + utils.JsonToStr(evt.showTitle) + ",callbacks:" + utils.JsonToStr(evt.callbacks) + ",real_value:" + values + ",waiting:'" + evt.waiting + "',callback:" + evt.callbacks.reduce + " }");
				} else {
					$(obj).attr("cm-ent", "{type:" + evt.type + ",cou:-1,to:'" + evt.to + "',max:'" + evt.max + "',_state:'" + evt._state + "',comment:'" + evt.comment + "',eid:'" + evt.eid + "',name:'" + evt.name + "',showTitle:" + utils.JsonToStr(evt.showTitle) + ",real_value:" + values + ",waiting:'" + evt.waiting + "' }");
				}
				if (evt.showTitle.type == 'text') {
					$(obj).text(evt.showTitle.reduce);
				} else if (evt.showTitle.type == 'class') {
					$(obj).addClass(evt.showTitle.reduce).removeClass(evt.showTitle.add);;
				}
				ent.init($(obj).parent(), false);
			} else {
				if (evt.showTitle.center && values == 1) {
					$(obj).attr('disabled', 'disabled');
					$(obj).text(evt.showTitle.center);
				} else {
					$(obj).attr('disabled', 'disabled');
					if (evt.showTitle.reduce) {
						$(obj).text(evt.showTitle.reduce);
					}
				}
			}
		} else {
			if (evt.callbacks) {
				$(obj).attr("cm-ent", "{type:" + evt.type + ",cou:1,to:'" + evt.to + "',max:'" + evt.max + "',_state:'" + evt._state + "',comment:'" + evt.comment + "',eid:'" + evt.eid + "',name:'" + evt.name + "',showTitle:" + utils.JsonToStr(evt.showTitle) + ",callbacks:" + utils.JsonToStr(evt.callbacks) + ",real_value:" + values + ",waiting:'" + evt.waiting + "',callback:" + evt.callbacks.add + " }");
			} else {
				$(obj).attr("cm-ent", "{type:" + evt.type + ",cou:1,to:'" + evt.to + "',max:'" + evt.max + "',_state:'" + evt._state + "',comment:'" + evt.comment + "',eid:'" + evt.eid + "',name:'" + evt.name + "',showTitle:" + utils.JsonToStr(evt.showTitle) + ",real_value:" + values + ",waiting:'" + evt.waiting + "' }");
			}
			if (evt.showTitle.type == 'text') {
				$(obj).text(evt.showTitle.add);
			} else if (evt.showTitle.type == 'class') {
				$(obj).addClass(evt.showTitle.add).removeClass(evt.showTitle.reduce);
			}
			ent.init($(obj).parent(), false);
		}
	}
}


const ent = {
	init: function (container, self, inited) {
		if (self)
			container = $('.page.page-current');

		if (!(utils._role && ent.isChecked)) {
			makeState(container, () => {
				ent.isChecked = true;
				entIints();
			}, false)
		} else {
			entIints();
		}

		function entIints() {
			container.find('[cm-ent]').each(function () {
				var that = $(this);
				var ent = $(this).attr('cm-ent');
				var $thiscount = 0;
				if (ent) {
					var evt = utils.StrToJson(ent);
					if (!that[0].ent) {
						that[0].ent = evt;
					};
					evt.comment = evt.comment ? evt.comment : '';
					if (evt.inited === undefined)
						evt.inited = true;
					evt.inited = inited ? true : evt.inited;
					if (evt.inited) {
						evt.eid = evt.eid ? evt.eid : '';
						evt.orga = evt.orga ? evt.orga : '';
						evt.max = evt.max ? evt.max : 1;
						evt.id = evt.id ? evt.id : '';
						evt.memto = evt.memto ? evt.memto : '';
						evt.info = evt.info ? evt.info : '';
						evt.me = evt.me ? evt.me : '';
						evt.end = evt.end ? evt.end : '';
						evt.role = evt.role ? evt.role.split(',') : [];
						evt.waiting = evt.waiting ? evt.waiting : '稍等';
						if (evt._state === '' || evt._state === undefined) {
							evt._state = 1;
						}
						if (evt.flt) {
							var fltJson = evt.flt;
							evt.flt = '<Filter xmlns="filter"><Row>';
							for (var key in fltJson) {
								var obj = fltJson[key];
								var t = 1;
								if (typeof obj == "object") {
									v = obj.value.toString();
									t = obj.type;
								} else
									v = obj.toString();
								v = utils.replaceQuery(v);
								evt.flt += '<Data Type="' + t + '" Value="' + v + '">' + key + '</Data>';
							}
							evt.flt += '</Row></Filter>';
							if (evt.flt == '<Filter xmlns="filter"><Row></Row></Filter>')
								evt.flt = '';
						} else {
							evt.flt = '';
						}
						var cou = evt.cou;
						cou = cou ? cou : 1;
						var toid = evt.to;
						if (toid) {
							var params = utils.getUrlParams();
							toid = toid.toString();
							for (var key in params) {
								if (key)
									toid = toid.replace('[' + key + ']', utils.getQueryString(key));
							}
						}
						that.unbind('click').click(function () {
							var $this = this;
							var waiting = evt.waiting;
							if ($(evt.comment).length == 1)
								evt.comment = evt.comment ? $(evt.comment).val() : '';
							if (waiting) {
								that[0]._oldHtml = that.html();
								that.html(waiting);
							}
							if (!evt.mode) {
								net.ajax({
									cmd: 'ent',
									type: 'post',
									dataType: 'json',
									data: {
										cmd: evt.cmd ? evt.cmd : 'ent',
										evt: evt.type,
										cou: cou,
										to: toid,
										max: evt.max,
										comment: evt.comment,
										eid: evt.eid,
										orga: evt.orga,
										info: evt.info,
										name: evt.name,
										max: evt.max,
										me: evt.me,
										end: evt.end,
										_state: evt._state,
										id: evt.id,
										path: location.pathname
									},
									callback: function (data) {
										if (waiting) {
											that.unbind('click');
											setTimeout(function () {
												that.html(that[0]._oldHtml);
												if (evt.showTitle) {
													entclick_back($this, evt, data);
												}
												evt.callback && evt.callback($this, data);
											}, 100)
										} else {
											if (evt.showTitle) {
												entclick_back($this, evt, data);
											}
											evt.callback && evt.callback($this, data);
										}
									}
								})
							}
						})
						if (evt.mode == 'get') {
							var evtType;
							if (evt.typ.type) evtType = evt.typ.type;
							else evtType = 1;
							net.ajax({
								cmd: 'ent',
								type: 'post',
								dataType: 'json',
								data: {
									typ: evtType,
									param: evt.param,
									tab: evt.tab,
									eid: evt.eid,
									ord: evt.ord,
									cou: cou,
									memto: evt.memto,
									flt: evt.flt
								},
								callback: function (data) {
									entget_back(data, evt);
									evt.callback && evt.callback(that, data);
								}
							})
						}
						if (evt.mode == 'cnt') {
							var evtType, data = {};
							if (evt.typ.type) evtType = evt.typ.type;
							else evtType = 1;
							data.rows = evt.data ? [evt.data] : [];
							data.success = evt.data ? true : false;
							entget_back(data, evt);
							evt.callback && evt.callback(that, data);
						}
					}
				}
			})
		}
	}
}

export default ent
