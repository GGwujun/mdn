import action from '../index';
export function authpost(btn, path, cmd, handle) {
	var _form = $(btn).closest('form').get(0);
	if (!_form._stoped) {
		if (btn._conf)
			var _conf = btn._conf;
		else
			var _conf = btn.attr('cm-action-sigin');
		action.DisableButton($(btn));
		var param = $(_form).serializeObject();
		if (param.surevalue && param.value != param.surevalue) {
			$.toast('密码不一致');
		} else {
			if (param.surevalue && param.value == param.surevalue) {
				delete param.surevalue;
			}
			param.cmd = cmd;
			param.lvl = _conf.role ? _conf.role : '';
			net.ajax({
				cmd: path,
				type: 'post',
				masked: false,
				dataType: 'json',
				data: param,
				callback: function (data) {
					action.EnableButton($(btn));
					if (data.success) {
						action.target(_conf, data);
						_conf.callback && _conf.callback(data);
						handle && handle(data);
						$.router.replacePage('#' + _conf.target, true);
					}
					else {
						var err = net.getErrorMessage(data);
						$.toast(err);
					}
				},
				error: function (e) {
					action.EnableButton($(btn));
					$.toast('服务请求错误!');
				}
			})
		}
	}
}