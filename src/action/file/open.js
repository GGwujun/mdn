export function fileopen() {
	$('body').delegate('[cm-action-file-open]', 'click', (function () {
		var conf = this._conf;
		if (!conf) {
			this._conf = utils.StrToJson($(this).attr('cm-action-file-open'));
			conf = this._conf;
		}
		var file = '';
		if (conf.name && conf.name.split(',').length > 1) {
			var name = conf.name.split(',');
			var path = conf.path.split(',');
			for (var i = 0; i < name.length; i++) {
				file += path[i] + '/' + name[i] + ',';
			}
			file = file.substring(0, file.length - 1);
		} else
			file = conf.path + '/' + conf.name;
		var data = { cmd: 'load', uuid: conf.uuid ? conf.uuid : '', host: conf.host, file: file };
		net.ajax({
			url: conf.url,
			cmd: conf.cmd ? conf.cmd : 'file',
			dataType: conf.type ? conf.type : "text",
			data: !conf.url ? data : null,
			cache: conf.cache,
			callback: function (res) {
				conf.callback && conf.callback(res);
			}
		})
	}))
}
