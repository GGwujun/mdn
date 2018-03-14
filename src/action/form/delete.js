
import action from '../index';
export function deletes() {
	$('body').undelegate('[cm-action-delete]').delegate('[cm-action-delete]', 'click', function () {
		var $ngroup = $(this).closest('[_group]');
		if ($ngroup.length == 1) {
			var nid = $ngroup.attr('_nid');
			if (nid.length < 32) {
				var g = $ngroup.parent().find('[cm-group="' + $ngroup.attr('_group') + '"]').get(0);
				if (!g.trush)
					g.trush = [];
				if (g.trush.indexOf(nid) < 0)
					g.trush.push(nid);
			}
			$ngroup.remove();
		}
		else {
			var $form = $(this).closest('form');
			var conf = this._conf;
			if (!conf) {
				conf = utils.StrToJson($(this).attr('cm-action'));
			}
			var nid = $form.attr('post-id');
			var param = {};
			param.id = nid;
			if (/^[A-Z\d]+$/.test(conf.flag)) {
				param.cmd = 'delete';
				param._cmd = 'cnt';
				param._flag = conf.flag;
			}
			else {
				param.cmd = 'del';
				param.name = conf.flag;
			}
			action.data.save(param, function (data) {
				if (conf.callback)
					conf.callback(data);
				else
					history.back(-1);
			})
		}
	});

	// $('body').undelegate('[cm-list] [cm-data] [cm-action-delete]').delegate('[cm-list] [cm-data] [cm-action-delete]', 'click', function () {
	// 	var $data = $(this).closest('[cm-data]');
	// 	if ($data.length == 1) {
	// 		var param = {};
	// 		param.id = $data.attr('cm-data');
	// 		var conf = utils.StrToJson($(this).attr('cm-action'));
	// 		if (/^[A-Z\d]+$/.test(conf.flag)) {
	// 			param.cmd = 'delete';
	// 			param._cmd = 'cnt';
	// 			param._flag = conf.flag;
	// 		}
	// 		else {
	// 			param.cmd = 'del';
	// 			param.name = conf.flag;
	// 		}
	// 		action.data.save(param, function (data) {
	// 			if (conf.callback)
	// 				conf.callback(data);
	// 			else
	// 				location.reload();
	// 		})
	// 	}
	// });
}