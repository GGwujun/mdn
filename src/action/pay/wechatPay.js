import utils from '../../util/utils';
import net from '../../net/net';
import { payWechat } from '../../cordova/wechat.js';

export default function wechatPay() {
    $('body').delegate('[cm-action-wechatPay]', 'click', function () {
        if (this._paying) return;
        this._paying = true;
        var that = this;
        var conf = this._conf;
        var fee = 0;
        var bod = '';
        var orderNo = '';
        var det = '';
        var att = '';
        if (!conf) {
            conf = utils.StrToJson($(this).attr('cm-action-wechatPay'));
            this._conf = conf;
        };
        if (typeof conf.fee === 'string') {
            fee = parseFloat($(conf.fee).text());
        } else {
            fee = parseFloat(conf.fee);
        }
        fee = fee * 100
        bod = $(conf.bod).text();
        if ($(conf.det).length) det = $(conf.det).text();
        if ($(conf.att).length) att = $(conf.att).text();
        orderNo = conf.orderNo;

        function onBridgeReady(fee, bod, orderNo, det, att) {
            net.ajax({
                cmd: 'wxpay',
                data: { cmd: 'pay', fee: fee, bod: bod, orderNo: orderNo, det: det, att: att },
                callback: function (data) {
                    if (data.success) {
                        delete data['success'];
                        WeixinJSBridge.invoke(
                            'getBrandWCPayRequest', data,
                            function (res) {
                                that._paying = false;
                                if (res.err_msg == "get_brand_wcpay_request:ok") {
                                    $.toast('支付成功！');
                                    conf.callback && conf.callback('success');
                                }
                                else {
                                    // $.toast(res.err_code + res.err_desc + res.err_msg);
                                    conf.callback && conf.callback('failed');
                                }
                            })
                    } else {
                        conf.callback && conf.callback(data);
                    }
                }
            })
        };

        function callPay(fee, bod, orderNo, det, att) {
            if (typeof WeixinJSBridge == "undefined") {
                if (document.addEventListener) {
                    document.addEventListener('WeixinJSBridgeReady', onBridgeReady, false);
                } else if (document.attachEvent) {
                    document.attachEvent('WeixinJSBridgeReady', onBridgeReady);
                    document.attachEvent('onWeixinJSBridgeReady', onBridgeReady);
                }
            } else {
                onBridgeReady(fee, bod, orderNo, det, att);
            }
        }

        if (utils.isWeiXin()) {
            callPay(fee, bod, orderNo, det, att);
        }
        else if (utils.isbrowser()) {
            payWechat(fee, bod, orderNo, det, att);
        } else {
            $.toast('还不支持浏览器的微信支付');
        }
    })

}