
/**
 * dsx
 * @param {*分享类型} type 1==微信朋友圈，2===微信好友
 * @param {*分享标题} title 
 * @param {*分享描述} description 
 * @param {*分享封面图} thumb 
 */

import utils from '../util/utils';
import net from '../net/net.js';

export function wechat(obj, params) {
    if (typeof Wechat === "undefined") {
        alert("Wechat plugin is not installed.");
        return false;
    }

    const scene = {
        1: Wechat.Scene.TIMELINE,
        2: Wechat.Scene.SESSION
    }


    if (!obj._sdk) {
        if (params)
            obj._sdk = params;
        else
            obj._sdk = utils.StrToJson($(obj).attr('cm-sdk-wechat'));

    }

    var scenes = obj._sdk.scene;
    var type = obj._sdk.type;

    var params = {
        scene: scene[scenes]
    };


    if (type == 'text') {
        params.text = $(obj._sdk.title).text();
    } else if (type == 'photo') {
        params.message = {};
        params.message.media = {};
        params.message.media.type = Wechat.Type.IMAGE;
        params.message.media.image = $(obj._sdk.img).attr('src');
    } else if (type == 'nongif' || type == 'gif') {
        params.message = {};
        params.message.media = {};
        params.message.media.type = Wechat.Type.EMOTION;
        params.message.media.emotion = $(obj._sdk.img).attr('src');
    } else {
        params.message = {
            title: $(obj._sdk.title).text(),
            description: $(obj._sdk.description).text(),
            thumb: $(obj._sdk.thumb).attr('src'),
            media: {}
        };

        switch (type) {
            case 'link-thumb':
                params.message.media.type = Wechat.Type.LINK;
                params.message.media.webpageUrl = obj._sdk.webpageUrl;
                break;

            case 'music':
                params.message.media.type = Wechat.Type.MUSIC;
                params.message.media.musicUrl = obj._sdk.musicUrl;
                params.message.media.musicDataUrl = obj._sdk.musicDataUrl;
                break;

            case 'video':
                params.message.media.type = Wechat.Type.VIDEO;
                params.message.media.videoUrl = obj._sdk.videoUrl;
                break;

            case 'app':
                params.message.media.type = Wechat.Type.APP;
                params.message.media.extInfo = obj._sdk.extInfo;
                params.message.media.url = obj._sdk.url;
                break;

            case 'file':
                params.message.media.type = Wechat.Type.FILE;
                params.message.media.file = obj._sdk.file;
                break;
            default:
                $.toast("参数配置错误");
                return false;
        }
    }


    Wechat.isInstalled(function (installed) {
        if (!installed) {
            $.toast('您没有安装微信！');
            return;
        }
    }, function (reason) {
        $.toast(reason);
    });

    Wechat.share(params, function () {
        $.toast("分享成功");
    }, function (reason) {
        $.toast(reason);
    });

    return true;

}


export function payWechat(fee, bod, orderNo, det, att) {

    if (typeof Wechat === "undefined") {
        alert("Wechat plugin is not installed.");
        return false;
    }

    Wechat.isInstalled(function (installed) {
        if (!installed) {
            $.toast('您没有安装微信！');
            return;
        }
    }, function (reason) {
        alert(reason);
    });

    net.ajax({
        cmd: 'wxpay',
        data: { cmd: 'pay', fee: fee, bod: bod, orderNo: orderNo, det: det, att: att, trade_type: 'app' },
        callback: function (params) {
            if (params.success) {
                delete params['success'];
                Wechat.sendPaymentRequest(params, function (data) {
                    if (data == 'ok') {
                        $.toast('支付成功！');
                        conf.callback && conf.callback(data);
                    }
                }, function (res) {
                    // $.toast(res.err_code + res.err_desc + res.err_msg);
                    conf.callback && conf.callback('failed');
                });
            } else {
                conf.callback && conf.callback(data);
            }
        }
    })
}

export function wechatAuth(handle) {
    var state = "_" + (+new Date());
    if (typeof Wechat === "undefined") {
        alert("Wechat plugin is not installed.");
        return false;
    }

    Wechat.isInstalled(function (installed) {
        if (!installed) {
            $.toast('您没有安装微信！');
            return;
        }
    }, function (reason) {
        alert(reason);
    });

    Wechat.auth("snsapi_userinfo", state, function (response) {
        if (response.code) {
            net.ajax({
                url: `/csb/weixin/?code=${response.code}&&wxapp='login'`,
                type: 'get',
                dataType: 'json',
                cache: true,
                callback: function (data) {
                    var conf = {};
                    if (conf)
                        conf.target = conf.target ? conf.target : $('head').attr('root');
                    if (data.success) {
                        utils._role = data.data[0];
                        conf.callback && conf.callback(data);
                        $.router.replacePage('#' + conf.target, true);
                        utils.initPage();
                    } else {
                        var err = net.getErrorMessage(data);
                        $.toast(err);
                    }
                }
            })
        }
    }, function (reason) {
        alert("Failed: " + reason);
    });
}


export function WechatShare() {
    $('body').delegate('[cm-sdk-wechat]', 'click', function () {
        wechat(this, null)
    })
}