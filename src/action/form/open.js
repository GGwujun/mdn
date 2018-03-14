import action from '../index';
export function open() {
	$('body').delegate('[cm-action-open]', 'click', (function () {
		var $form = $(this).closest('form');
		var conf = this._conf;
		var id = $form.attr('post-id');
		if (!id || id.length > 32) {
			id = conf.id ? conf.id : utils.getUrlParams('id').id;
		}
		if (conf.memb == "1") {
			loadFromId($form, id, conf);
		}
		else if (id) {
			if (id.toString().length < 32)
				loadFromId($form, id, conf);
			else
				loadFromDef($form, conf);
		}
		else
			loadFromDef($form, conf);
	}));

	function makeFormTable($form) {
		var _table = [];
		$form.find('[cm-group]').each(function () {
			var g = $(this).attr('cm-group');
			if (_table.indexOf(g) < 0) {
				_table.push(g)
			}
		})
		return _table;
	}

	function loadFromId($form, id, conf) {
		var _table = makeFormTable($form, conf);
		$form.find('[_group]').remove();
		$form.attr('post-id', id);
		if (conf.id && conf.id === -1001) id = '';
		var main = conf.flag;
		var param = { cmd: 'data', id: id, main: main, detail: _table.join(','), memb: conf.memb ? conf.memb : ' ' };
		action.data.load(param, function (data) {
			var datas = data.data;

			load($form, datas[0][0]);

			for (var i = 1; i < datas.length; i++) {
				var ddata = datas[i];
				var group = _table[i - 1];
				for (var j = 0; j < ddata.length; j++) {
					action.add($form.find('[cm-group="' + group + '"]'), ddata[j]);
				}
			}
			$form.fadeIn(500);
			conf.callback && conf.callback(datas);
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
			};
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
		else {
			$form.fadeIn(500);
			conf.callback && conf.callback(data);
		}
	}

	function load($form, data) {
		if ($form.get(0)._conf && $form.get(0)._conf.view) {
			for (var key in data) {
				var item = $form.find('[fld="' + key + '"]');
				item.html('');
				item.each(function () {
					if (item.attr('img')) {
						var imgAttr = data[key] && data[key].split(',');
						for (var i = 0; i < imgAttr.length; i++) {
							$('<img src="' + imgAttr[i] + '" />').appendTo(this);

						}
					}
					else
						item.html(data[key]);
				})
			}
		}
		else {
			var f = [];
			$form.attr('post-id', data['id']);
			$form.find('[name],[_name]').each(function () {
				if ($(this).closest('[_group]').length == 0) {
					if ($(this).find('[name],[_name]').length == 0) {
						var combo = $(this).parents('[cm-input-combo]');
						if (combo.length == 1) {
							f.push(combo[0]);
						}
						else
							f.push(this);
					}

				}
			});
			for (var i = 0; i < f.length; i++) {
				var $f = $(f[i]);
				$f.wrap('<form></form>');
				//page.input.setValue($f.parent(), data);
				$f.unwrap();
			}
		}
	}
}