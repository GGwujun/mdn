import action from '../index';
function saveState(act, frm) {
	var conf = act._conf;
	var data = $(frm).serializeObject();
	data._state = conf.state;
	param.cmd = 'save';
	param._cmd = conf.cmd ? conf.cmd : 'cnt';
	param._flag = conf.flag;
	param.data = data;
	param.encode = true;
	action.data.save(param, conf.callback);
}

/**
 * 审核，审批
 */

export function approve() {
	$('body').each(function () {
		var nid = $(this).attr('post-id');
		if (!nid) $(this).attr('post-id', utils.uuid());
		else $(this).attr('post-id', utils.replaceQuery(nid));
		$(this).submit(function () {
			return false;
		})
		var that = this;
		$(this).delegate('[cm-action-approve]', 'click', (function () {
			if (!this._stoped) {
				if (Validator.validate($(this).closest('form').get(0))) {
					saveState(this, that)
				}
			}
		}))
	})
}
