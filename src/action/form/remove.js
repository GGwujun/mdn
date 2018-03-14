import action from '../index';
export function remove() {
	$('body').delegate('[cm-action-remove]', 'click', function () {
		var $ngroup = $(this).closest('[_group]');
		var conf = $ngroup[0]._conf;
		var nid = $ngroup.attr('_nid');
		if (nid.length < 32) {
			action.data.save({ _cmd: 'cnt', cmd: 'delete', id: nid, _flag: conf.flag }, function (data) {
				$ngroup.remove();
			})
		}
		else
			$ngroup.remove();

	});
}