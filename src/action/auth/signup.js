/**
 * 通用会员注册
 */

import { authpost } from './authpost'
export function signup() {
	$('body').delegate('[cm-action-signup]', 'click', (function () {
		if (!this._conf) {
			this._conf = utils.StrToJson($(this).attr('cm-action-signup'));
		}
		authpost(this, "auth", "signup");
	}))
}