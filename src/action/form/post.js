import action from '../index';

var conf_flag = "";
export function post() {
	$('body').each(function () {
		var nid = $(this).attr('post-id');
		if (!nid) {
			$(this).attr('post-id', utils.uuid('-'));
		}
		else {
			$(this).attr('post-id', utils.replaceQuery(nid));
		}
		$(this).submit(function () {
			return false;
		})
		$(this).undelegate('[cm-action-post]').delegate('[cm-action-post]', 'click', (function () {
			if (!this._stoped) {
				if (!this._conf) {
					this._conf = utils.StrToJson($(this).attr('cm-action'));
				}
				conf_flag = this._conf.flag;
				if (this._conf.mult)
					SaveGroups(this);
				else if (this._conf.customize)
					SaveCusForm(this, this._conf);
				else
					SaveForms(this);
			}
		}))
	})
}

function SaveGroups(elem) {
	var conf = elem._conf;
	var $form = $(elem).closest('form');
	$form.find('[_group]').each(function () {
		if (conf.defa) {
			for (var key in conf.defa) {
				$(this).append('<input name="' + key + '" type="hidden" value="' + conf.defa[key] + '" />');
			}
		}
		$(this).append('<input name="id" type="hidden" value="' + $(this).attr('_nid') + '" />');
	})
	var data = $form.serializeObject();
	$form.find('[_group] input[name="id"]').remove();
	saveGroup(data, conf, function (data) {
		if (conf.handle && typeof (conf.handle) === 'function')
			conf.handle(data);
		else {
			target(conf, data);
			$.router.back()
		}
	});
}

function saveGroup(data, conf, handle) {
	var param = {};
	param.cmd = 'msave';
	param._cmd = 'cnt';
	param._flag = conf.flag;
	param.data = utils.JsonToStr(data);
	param.encode = true;
	action.data.save(param, handle);
}

function SaveForms(elem) {
	var $form = $(elem).closest('form');
	var _group = $form.find('[_group]');
	var groupP = _group.parent();
	var conf = elem._conf;
	var master = conf.flag;
	var len = _group.length;
	if (len == 0) {
		saveForm($form, conf, conf.callback);
	}
	else {
		var datas = [];
		var i = -1;
		function postGroup(did) {
			i++;
			if (i < len) {
				var _g = _group.eq(i);
				var post_id = _g.attr('_nid') ? _g.attr('_nid') : utils.uuid('-');
				_g.wrap('<form post-id="' + post_id + '"></form>');
				conf.flag = _g.attr('_group');
				conf.defa = { did: did };
				saveForm(_g.parent(), conf, function (data) {
					conf.flag = conf_flag;
					datas.push(data.data);
					_g.attr('_nid', _g.parent().attr('post-id'));
					_g.unwrap();
					postGroup(did);
				})
			}
			else {
				conf.callback && conf.callback(datas);
			}
		}

		_group.remove();
		saveForm($form, conf, function (data) {
			groupP.append(_group)
			if (data.success) {
				datas.push(data.data);
				postGroup(data.data[0].id);
			}
		});
	}
}

function saveForm($form, conf, handle) {
	var param = $form.serializeObject();
	if (conf.data)
		param = conf.data
	if (conf.defa) {
		for (var key in conf.defa) {
			param[key] = conf.defa[key];
		}
	}
	param.cmd = 'save';
	param._cmd = conf.cmd ? conf.cmd : 'cnt';
	param._flag = conf.flag;
	param._id = $form.attr('post-id');
	if (!param._id || (param._id && param._id == "-1001")) param._id = utils.uuid('-');
	action.data.save(param, function (data) {
		if (data.success) {
			var row = data.data[0];
			//$form.attr('post-id', row.id);
		}
		if (handle && typeof (handle) === 'function')
			handle(data);
		else {
			target(conf, data);
			$.router.back()
		}

	});
}
function target(conf, data) {
	if (conf.target) {
		var target = conf.target.split('&');
		if (target.length > 1) {
			$('#' + target[0]).find(target[1]).text(data.data[0][target[2]])
		} else if (target.length = 1) {
			$('#' + target[0])[0].savereload = true;
		}
	}
}

function SaveCusForm(elem, conf) {
	var $form = $(elem).closest('form');
	var param = $form.serializeObject();
	if (conf.defa) {
		for (var key in conf.defa) {
			param[key] = conf.defa[key];
		}
	}
	if (conf.param) {
		for (var key in conf.param) {
			param[key] = conf.param[key];
		}
	}
	action.data.save(param, function (data) {
		if (data.success) {
			var row = data.data[0];
			$form.attr('post-id', row.id);
		}
		if (conf.handle && typeof (conf.handle) === 'function')
			conf.handle(data);
		else {
			target(conf, data);
			$.router.back()
		}
	});
}