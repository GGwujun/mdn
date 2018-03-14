import action from '../index';  

export function saveList(conf, data) {
	var xml = '<Table name="' + conf.code + '" xmlns="table">\n';
	for (var i = 0; i < data.length; i++) {
		var row = data[i];
		if (i == 0) {
			xml += '<Row>';
			for (var name in row) {
				xml += '\n<Data>' + name + '</Data>';
			}
			xml += '\n</Row>\n';
		}
		xml += '<Row>';
		for (var name in row) {
			var v = '';
			var d = row[name];
			if (typeof d === "object") {
				v = utils.JsonToStr(d);
			}
			else
				v = d.toString();
			xml += '\n<Data><![CDATA[' + v + ']]></Data>';
		}
		xml += '\n</Row>\n';
	}
	var param = { param: 'save', data: xml };
	action.data.save(param, function (ret) {
		if (ret.success) {
			var rows = ret.data;
			if (rows.length > 0 && rows[0][0].id == "0") { //保存没有影响
				utils.Alert(rows[0][0].msg);
			}
			else {

			}
		}
		conf.callback && conf.callback(ret);
	})
}