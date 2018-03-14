import action from '../index';
export function add() {
	$('body').delegate('[cm-action-add]', 'click', (function () {
		if (!this._conf) {
			if ($(this).attr('cm-action'))
				this._conf = utils.StrToJson($(this).attr('cm-action'));
		}
		action.add($(this).closest('form').find('[cm-group="' + this._conf.target + '"]'))
	}));

	action.add = function (source, data, inputInit) {
		var elem = source.clone();
		if (source[0]._conf)
			elem[0]._conf = source[0]._conf;
		var nid = '';
		if (data)
			nid = data.id;
		else
			nid = utils.uuid('-');
		var group = source.attr('cm-group');
		elem.removeAttr('cm-group').attr('_group', group).attr('_nid', nid);
		var last = source.parent().find('[_group="' + group + '"]:last-child');
		if (last.length == 0)
			last = source;
		var last_group = last.find('[_group="' + group + '"]');
		if (!last_group.length)
			last.after(elem);
		else
			last_group.eq(last_group.length - 1).after(elem);
		elem.find('[fld]').each(function () {
			var v = data[$(this).attr('fld')];
			if (!v) v = '';
			$(this).html(v);
		})
	}
}