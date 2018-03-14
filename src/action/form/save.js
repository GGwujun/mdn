import utils from '../../util/utils';
import action from '../index';
export function save() {
	$('body').each(function () {
		 var nid = $(this).attr('post-id');
		 if (!nid) {
		 	$(this).attr('post-id', utils.uuid());
		 }
		 else {
		 	$(this).attr('post-id', utils.replaceQuery(nid));
		 }
		 $(this).submit(function () {
		 	return false;
		 })

		$(this).delegate('[cm-action-save]', 'click', function () {
			if (!this._stoped) {
				makeSaveData(this);
			}
		})
	})

	/**
	 * 
	 * @param {*dom} elem  提交按钮父级form对象 
	 * @param {*object} conf 提交按钮配置参数
	 */

	function makePostForms(elem, conf) {
		function makeDelete(_g) {
			var d = elem.find('[cm-group="' + _g + '"]').get(0);
			if (!d.trush) {
				d.trush = [];
			}
			return d.trush.join(',');
		}

		var $c = elem;
		var _group = [];

		$c.find('[_group]').each(function () {
			var g = $(this).attr('_group');
			if (_group.indexOf(g) < 0) {
				_group.push(g)
			}
		});

		var temp = $('<div></div>');

		var xml = '';
		for (var i = 0; i < _group.length; i++) {
			var g = _group[i];
			xml += '<Table name="' + g + '" deletes="' + makeDelete(g) + '" xmlns="table">\n';
			var $g = $c.find('[_group="' + g + '"]');
			$g.appendTo(temp);
			$g.wrap('<form></form>');
			var header;
			$g.parent().each(function (inx) {
				$(this).attr('post-id', $(this).find('[_nid]').attr('_nid') ? $(this).find('[_nid]').attr('_nid') : utils.uuid('-'));
				if (inx == 0) {
					header = utils.serializeForm($(this));
					xml += makeElemHeader(header, conf, $(this));
				}
				xml += makeElemRow(this, header);
			});
			$g.unwrap();
			xml += '</Table>\n';
		}

		var $f = $c;
		var mxml = '<Table name="' + conf.flag + '" xmlns="table">\n';
		var header = utils.serializeForm($f);

		for (var i = 0; i < _group.length; i++) {
			$c.find('[cm-group="' + g + '"]').after(temp.find('[_group="' + g + '"]'));
		}

		temp.remove();

		if (conf && conf.defa) {
			for (var key in conf.defa) {
				header[key] = conf.defa[key];
			}
		}
		mxml += makeElemHeader(header, conf, elem);
		var nid = elem.attr('post-id');
		if (!nid || (nid && nid == "-1001")) nid = utils.uuid('-');
		mxml += makeElemRow($f, header, conf, nid);
		mxml += '</Table>';


		return mxml + '\n' + xml;
	}

	function makeSaveData(elem) {
		var conf = elem._conf;
		if (!conf) {
			conf = utils.StrToJson($(this).attr('cm-action'));
		}
		var _form = $(elem).closest('form').get(0);
		var xml = makePostForms($(_form), conf);
		var param = { param: 'save', data: xml, memb: conf.memb ? conf.memb : ' ' };
		var cmd = conf.cmd ? conf.cmd : 'data';
		param['_cmd'] = cmd;
		action.data.save(param, function (data) {
			if (data.success) {
				var rows = data.data;
				if (rows.length > 0 && rows[0][0].id == "0") { //保存没有影响
					$.alert(rows[0][0].msg);
				}
				else {
					for (var i = 0; i < rows.length; i++) {
						var row = rows[i];
						if (i == 0) {
							$(_form).attr('post-id', row[0].id);
						}
						else {
							for (var j = 0; j < row.length; j++) {
								$(_form).find('[_nid="' + row[j].__id + '"]').attr('_nid', row[j].id);
							}
						}
					}
				}
			}
			conf.callback && conf.callback(data);
		})
	}

	function makeElemHeader(header, conf, $elem) {
		var xml = '<Row>\n<Data Type="1" Len="0" Title="ID">id</Data>';
		for (var name in header) {
			var el = $elem.find('[name="' + name + '"]');
			if (!$(el).length)
				el = $elem.find('[_name="' + name + '"]');
			var dbtype = getElAttr(el, 'dbType', 1);
			var len = getElAttr(el, 'len', 50);
			if (dbtype == 5 && len == 'max')
				len = '';
			xml += '\n<Data Type="' + dbtype + '" Len="' + len + '" Title="' + getElAttr(el, 'title', '') + '">' + name + '</Data>';
		}
		xml += '\n</Row>\n';
		return xml;
	}

	function makeElemRow(_form, header, conf, postid) {
		postid = postid ? postid : $(_form).attr('post-id');
		var _elems = utils.serializeForm($(_form));
		var xml = '<Row>\n<Data>' + postid + '</Data>';
		for (var name in header) {
			var v = _elems[name] ? _elems[name] : '';
			if (conf && conf.defa) {
				if (conf.defa[name])
					v = conf.defa[name];
			}
			xml += '\n<Data><![CDATA[' + v + ']]></Data>';
		}
		xml += '\n</Row>\n';
		return xml;
	}

	function getElAttr(el, attr, def) {
		var data = $(el).attr(attr);
		if (!data)
			data = def;
		return data;
	}
}
