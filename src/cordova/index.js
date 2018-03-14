/*
cordova核心代码
*/

import cordova_utils from './utils';
import { WechatShare, wechat, wechatAuth, payWechat } from './wechat';
import { qqSdk } from './qqSdk';


if (window.history && window.history.pushState) {
    $(window).on('popstate', function () {
        if ($('.page.page-current .popup.modal-in').length) {
            setTimeout(function () {
                $.closeModal('.modal-in');
            }, 100);
            history.forward(1);
        }
    });
}

function uploads(imagedata, Handle) {
    var options = new FileUploadOptions();
    options.fileKey = 'upfile';
    options.fileName = 'name.jpg';
    options.headers = {};

    var fileTransfer = new FileTransfer();
    $.showPreloader('图片上传中...');

    let url = utils.getPath() + '/upload/';

    fileTransfer.upload(imagedata, url, win, fail, options).then((data) => {
        let response = utils.StrToJson(data.response);
        if (response.state == 'SUCCESS') {
            $.hidePreloader();
            Handle && Handle(response.url);
            return response.url
        }
    }, (err) => {
        alert(err);
    });

    function win(data) {
        let response = utils.StrToJson(data.response);
        if (response.state == 'SUCCESS') {
            $.hidePreloader();
            Handle && Handle(response.url);
            return response.url
        }
    }

    function fail(error) {
        alert("An error has occurred: Code = " + error.code);
    }
}
var app = {
    initialize: function () {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },

    backButtonPressed: false,

    onDeviceReady: function () {
        StatusBar.overlaysWebView(false);
        var status = $('head').attr('status') ? $('head').attr('status') : '#006CBA';
        StatusBar.backgroundColorByHexString(status);
        window.app = app;
        app.cordova_utils.detectionUpgrade();
        this.backbutton();
        WechatShare();
        qqSdk();
        app.initMap();
    },

    backbutton: function () {
        var that = this;
        document.addEventListener('backbutton', function (evt) {
            if (cordova.platformId !== 'windows') {
                if ($('head').attr('root')) {
                    var page_currentid = $('.page.page-current').attr('id');
                    var root = $('head').attr('root');
                    var update = $('.page.page-current').attr('update');
                    if (!update) {
                        if (page_currentid === root || page_currentid === 'login') {
                            if (that.backButtonPressed)
                                that.exitApp()
                            else {
                                $.toast("再按一次退出应用", 'bottom');
                                that.backButtonPressed = true;
                                setTimeout(() => that.backButtonPressed = false, 2000);//2秒内没有再次点击返回则将触发标志标记为false
                            }
                        } else {
                            window.history.back();
                        }
                    }
                } else {
                    window.history.back();
                }
            } else {
                throw new Error('Exit');
            }
        }, false);
    },

    exitApp: function () {
        navigator.app.exitApp();
    },
    cordova_utils: cordova_utils,
    wechat: wechat,
    wechatAuth: wechatAuth,
    payWechat: payWechat,
    uploadpPictures: {
        // 拍照
        takePhoto: function (handle) {
            var options = {
                // Some common settings are 20, 50, and 100
                quality: 50,
                destinationType: Camera.DestinationType.FILE_URI,
                // In this app, dynamically set the picture source, Camera or photo gallery
                encodingType: Camera.EncodingType.JPEG,
                mediaType: Camera.MediaType.PICTURE,
                saveToPhotoAlbum: true,
                sourceType: Camera.PictureSourceType.CAMERA,//拍照时，此参数必须有，否则拍照之后报错，照片不能保存
                correctOrientation: true  //Corrects Android orientation quirks
            }
			/**
			 * imageData就是照片的路径，关于这个imageData还有一些细微的用法，可以参考官方的文档。
			 */
            navigator.camera.getPicture(onSuccess, onFail, options);
            function onSuccess(imageData) {
                let base64Image = "data:image/jpeg;base64," + imageData;
                uploads(imageData, function (imgurl) {
                    handle && handle(imgurl);
                })
            }
            function onFail(message) {
                //alert('Failed because: ' + message);
            }
        },



        //选择照片
        choosePhoto: function (handle) {
            var options = {
                // Some common settings are 20, 50, and 100
                quality: 50,
                destinationType: Camera.DestinationType.FILE_URI,
                // In this app, dynamically set the picture source, Camera or photo gallery
                sourceType: 0,//0对应的值为PHOTOLIBRARY ，即打开相册
                encodingType: Camera.EncodingType.JPEG,
                mediaType: Camera.MediaType.PICTURE,
                allowEdit: true,
                correctOrientation: true  //Corrects Android orientation quirks
            }
            navigator.camera.getPicture(onSuccess, onFail, options);
            function onSuccess(imageData) {
                let base64Image = "data:image/jpeg;base64," + imageData;
                uploads(imageData, function (imgurl) {
                    handle && handle(imgurl);
                })
            }
            function onFail(message) {
                //alert('Failed because: ' + message);
            }
        }
    },
    bcScan: function (handle) {
        cordova.plugins.barcodeScanner.scan(
            function (result) {
                // $.alert("We got a barcode\n" +
                //     "Result: " + result.text + "\n" +
                //     "Format: " + result.format + "\n" +
                //     "Cancelled: " + result.cancelled);
                handle && handle(result);
            },
            function (error) {
                // $.alert("Scanning failed: " + error);
                handle && handle(error);
            },
            {
                preferFrontCamera: false, // iOS and Android 前置摄像头
                showFlipCameraButton: false, // iOS and Android 反转相机
                showTorchButton: false, // iOS and Android 显示手电按钮
                torchOn: false, // Android, launch with the torch switched on (if available)
                saveHistory: true, // Android, save scan history (default false)
                beep: true, // Android, beep when scan succeeds (default true)
                prompt: "将二维码/条码放进框内，即可自动扫描", // Android
                resultDisplayDuration: 500, // Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
                formats: "QR_CODE,PDF_417", // default: all but PDF_417 and RSS_EXPANDED
                orientation: "portrait", // Android only (portrait|landscape), default unset so it rotates with the device
                disableAnimations: true, // iOS
                disableSuccessBeep: false // iOS
            }
        );
    },
    /**
     * 包名
     * @百度地图：com.baidu.BaiduMap
     * @高德地图 com.autonavi.minimap
     * @腾讯地图 com.tencent.map
     */
    mapArray: [],
    initMap: function () {
        var self = this;
        var scheme = [];
        if (cordova_utils.isAndroid()) {
            scheme = [
                { pck: 'com.baidu.BaiduMap', src: 'https://7402.csdu.net/83c93db277114d08af57809047f27631/assets/img/11.png', name: '百度地图', uri: 'baidumap://map/direction?origin=我的位置&destination=' },
                { pck: 'com.autonavi.minimap', src: 'https://7402.csdu.net/83c93db277114d08af57809047f27631/assets/img/22.png', name: '高德地图', uri: 'androidamap://route?sourceApplication=softname&dev=0&m=0&t=0&sname=我的位置&dname=' },
                { pck: 'com.tencent.map', src: 'https://7402.csdu.net/83c93db277114d08af57809047f27631/assets/img/33.png', name: '腾讯地图', uri: 'qqmap://map/routeplan?type=drive&referer=风信子&from=我的位置&to=' }
            ];
        }


        if (cordova_utils.isIos()) {
            scheme = [
                { pck: 'baidu://', src: 'https://7402.csdu.net/83c93db277114d08af57809047f27631/assets/img/11.png', name: '百度地图', uri: 'baidumap://map/direction?origin=我的位置&destination=' },
                { pck: 'autonavi://', src: 'https://7402.csdu.net/83c93db277114d08af57809047f27631/assets/img/22.png', name: '高德地图', uri: 'androidamap://route?sourceApplication=softname&dev=0&m=0&t=0&sname=我的位置&dname=' },
                { pck: 'tencent://', src: 'https://7402.csdu.net/83c93db277114d08af57809047f27631/assets/img/33.png', name: '腾讯地图', uri: 'qqmap://map/routeplan?type=drive&referer=风信子&from=我的位置&to=' }
            ];
        }
        scheme.forEach(function (item, index) {
            appAvailability.check(
                item.pck,
                function () {
                    var ret = self.mapArray.find(function (data) {
                        return data.name === item.name;
                    })
                    if (!ret) {
                        self.mapArray.push(item)
                    }
                },
                function () {
                    //$.toast(item.name + '不可用 :(');
                }
            );
        });
    },
    openMap: function (address, handle) {
        var self = this;
        function openMaps(pck, uri) {
            var sApp = startApp.set({ /* params */
                "action": "ACTION_VIEW",
                "category": "CATEGORY_DEFAULT",
                "type": "text/css",
                "package": pck,
                "uri": uri,
                "flags": ["FLAG_ACTIVITY_CLEAR_TOP", "FLAG_ACTIVITY_CLEAR_TASK"],
                // "component": ["com.android.GoBallistic","com.android.GoBallistic.Activity"],  
                "intentstart": "startActivity",
            }, { /* extras */
                    "EXTRA_STREAM": "extraValue1",
                    "extraKey2": "extraValue2"
                });
            sApp.start(function () { /* success */
                // $.toast("返回风信子");
            }, function (error) { /* fail */
                //$.alert(error);
                //$.toast('开启地图出错');
            });
        }
        var buttons1 = [
            {
                text: '请选择',
                label: true
            }
        ];
        if (!self.mapArray.length) {
            $.toast('您手机上没有可用的地图软件');
            return false;
        }
        self.mapArray.forEach(function (item, index) {
            buttons1.push(
                {
                    text: item.name,
                    bold: true,
                    color: 'danger',
                    src: item.src,
                    onClick: function () {
                        openMaps(item.pck, item.uri + address)
                    }
                }
            )
        });
        var buttons2 = [
            {
                text: '取消',
                bg: 'danger'
            }
        ];
        var groups = [buttons1, buttons2];
        $.actionGird(groups);
    },
    localNotification: function (param) {
        cordova.plugins.notification.local.schedule({
            id: 1,
            title: '这个是测试的风信子本地通知，内容我只能随便写哦',
            text: '这个是测试的风信子本地通知，/n标题要搞的长一点，我也没病拿法，虽败那些，随便写，那又能怎么办，谁让你没内容，没内容啊。有本事你给我内容啊，真的是，没内容我怎么搞',
            icon: 'file://android_asset/www/logo.jpg',
            smallIcon: 'file://android_asset/www/logo.jpg',
            badge: 12,
            data: { meetingId: 222 }
        });

        cordova.plugins.notification.local.on('click', function (notification) {
            alert('clicked: ' + notification.data);
        });
    },
    checkPermissions: function () {
        var permissions = cordova.plugins.permissions;
        var appPermission = window && window.appPermission;
        appPermission.forEach(function () {

        })
        permissions.checkPermission(permissions.CAMERA, function (status) {
            if (status.checkPermission) {
                alert("Yes :D ");
            }
            else {
                permissions.requestPermission(permissions.CAMERA, success, error);
                function error() {
                    console.warn('Camera permission is not turned on');
                }
                function success(status) {
                    if (!status.hasPermission) error();
                }
            }
        });
    }
};


export default app