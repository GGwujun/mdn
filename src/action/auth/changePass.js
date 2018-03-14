/**
 * 修改密码
 */

import { authpost } from './authpost'
export function changePass() {
    $('body').delegate('[cm-action-changePass]', 'click', (function () {
        if (!this._conf) {
            this._conf = utils.StrToJson($(this).attr('cm-action-changePass'));
        }
        
        authpost(this, "cnt", "chg");
    }))
}