import action from '../index';
export function load() {
	$('body').delegate('[cm-action-load]', 'click', (function () {
		var $form = $(this).closest('form');
		var conf = this._conf;
		var id = $form.attr('post-id');
		if (!id || id.toString().length > 32)
			id = conf.id ? conf.id : utils.getUrlParams('id').id;
		if (id) {
			if (id.toString().length < 32)
				loadFromId($form, id, conf);
			else
				loadFromDef($form, conf);
		}
		else if (conf.all) {
			loadAll($form, conf);
		}
		else
			loadFromDef($form, conf);
	}));


	function loadFromId($form, id, conf) {
		var param = { _cmd: 'cnt', cmd: 'data', _id: id, _flag: conf.flag, ord: conf.ord };
		action.data.load(param, function (data) {
			if (data.success) {
				var row = data.data[0];
				$form.attr('post-id', row.id);
			}
			$form.fadeIn(500);
			conf.callback && conf.callback(data);
		})
	}

	function loadFromDef($form, conf) {
		var def = '';
		$form.find('[def]').each(function () {
			var _conf = this._conf;
			if (_conf) {
				var _def = $(this).attr('def');
				if (def !== "") def += '\n';
				def += _conf.name + '=' + _def;
			}
		})
		if (def) {
			var param = { _cmd: 'data', cmd: 'default', def: def };
			action.data.load(param, function (data) {
				$form.fadeIn(500);
				if (data.success) {
					load($form, data.data);
				}
				conf.callback && conf.callback(data);
			})
		}
		else
			$form.fadeIn(500);
	}


	function loadAll($form, conf) {
		$form.find('[_group]').remove();
		var param = { _cmd: 'cnt', cmd: 'data', _flag: conf.flag, ord: conf.ord };
		if (conf.defa) {
			var flt = '<Filter xmlns="filter"><Row>';
			for (var key in conf.defa) {
				var obj = conf.defa[key];
				flt += '<Data Type="1" Value="' + conf.defa[key] + '">' + key + '</Data>';
			}
			flt += '</Row></Filter>';
			param.flt = flt;
		}
		action.data.load(param, function (data) {
			if (data.success) {
				var datas = data.data;
				for (var i = 0; i < datas.length; i++) {
					action.add($form.find('[cm-group]'), datas[i]);
				}
			}
			$form.fadeIn(500);
			conf.callback && conf.callback(data);
		})
	}
}