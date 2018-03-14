import net from '../../net/net';

export function filesave() {
	$('body').delegate('[cm-action-file-save]', 'click', (function () {
		var conf = this._conf;

		if (!conf) {
			this._conf = utils.StrToJson($(this).attr('cm-action-file-save'));
			conf = this._conf;
		}
		if (conf.cont) {
			this.content = conf.cont();
		}
		var data = { cmd: 'save', uuid: conf.uuid ? conf.uuid : '', host: conf.host, cont: this.content, file: conf.path + '/' + conf.name };
		net.ajax({
			url: conf.url,
			cmd: conf.cmd ? conf.cmd : 'file',
			type: 'post',
			dataType: conf.type ? conf.type : "text",
			data: data,
			callback: function (res) {
				conf.callback && conf.callback(res);
			}
		})
	}))
}
