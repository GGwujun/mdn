import action from '../index';
export function postList(conf, data) {
	function save(row) {
		var param = {};
		param.cmd = 'save';
		param._cmd = 'cnt';
		param._flag = conf.code;
		param._id = row.id;
		for (var key in row) {
			var v = '';
			var d = row[key];
			if (typeof d === "object") {
				v = utils.JsonToStr(d);
			}
			else
				v = d.toString();
			param[key] = v;
		}
		delete param['id'];
		action.data.save(param, function (ret) {
			conf.callback && conf.callback(ret);
		});
	}

	for (var i = 0; i < data.length; i++) {
		save(data[i]);
	}
}
