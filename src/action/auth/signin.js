/**
 * 通用会员登陆
 */
import utils from '../../util/utils';
import { authpost } from './authpost';
import { wechatAuth } from '../../cordova/wechat.js'

export function signin() {
    $('body').delegate('[cm-action-signin]', 'click', (function () {
        if (!this._conf) {
            this._conf = utils.StrToJson($(this).attr('cm-action-signin'));
        }

        if (this._conf.type == 'weixin') {
            wechatAuth()
        } else {
            authpost(this, utils.isWeiXin() ? "weixin" : "auth", "signin", function (data) {
                utils._role = data.data[0];
                //重置所有页面，除了当前页面
                utils.initPage();
            })
        }
    }))
}