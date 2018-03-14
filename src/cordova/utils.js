import utils from '../util/utils';

const DOWN_URL = '/csb/cont/1000/';
const DOWN_PACKAGE = 'fxzversion.json';



const cordova_utils = {
    appName: '',
    appVersion: '',
    warn: function (info) {
        console.log('%cNativeService/' + info, 'color:#e8c406');
    },

    /**
     * 通过浏览器打开url
     */
    openUrlByBrowser: function (url) {
        cordova.InAppBrowser.open(url, '_blank', 'location=yes');
    },

    /**
     * 检查app是否需要升级
     */
    detectionUpgrade: function (handle) {
        //这里连接后台获取app最新版本号,然后与当前app版本号(this.getVersionNumber())对比
        let self = this;
        let version = {
            cmd: `${DOWN_URL}${utils.getProjn()}/${DOWN_PACKAGE}`,
            data: {}
        }
        net.ajax(
            {
                url: version.cmd,
                data: version.data,
                callback: function (datas) {
                    cordova.getAppVersion.getVersionCode(function (version) {
                        cordova.getAppVersion.getVersionNumber(function (number) {
                            utils.version = number;
                        })
                        let versions = Number(version);
                        datas.vCode = Number(datas.vCode);
                        if (versions >= datas.vCode) {
                            cordova.getAppVersion.getVersionNumber(function (number) {
                                var str = '当前是最新版本' + number;
                                handle && handle(str)
                            })
                        } else if (versions < datas.vCode) {
                            var isForce = datas.force ? datas.force : false;
                            if (isForce)
                                self.forceUpdata(datas)
                            else {
                                $.confirm({ title: '新版本更新', text: datas.vContent, modalButtonCancel: '以后再说', modalButtonOk: '立即安装' }, function () {
                                    $('.page.page-current').attr('update', true);
                                    $.showPreloader('已下载0%');
                                    self.downloadApp(datas);
                                }, function () {

                                })
                            }
                        }
                    });

                }
            }
        )
    },

    forceUpdata(datas) {
        var html = `<div class="modal modal-no-buttons modal-in" style="display: block; margin-top: -78px;">
                                        <div class="modal-inner">
                                            <div class="modal-title">强制更新中...</div>
                                            <div class="modal-title update">已下载0%</div>
                                            <div class="modal-text">
                                                <div class="preloader"></div>
                                            </div>
                                        </div>
                                        <div class="modal-buttons "></div>
                                    </div>
                                    <div style="position: absolute;top: 0;left: 0;z-index: 10600;width: 100%;height: 100%;background: rgba(0,0,0,.4);-webkit-transition-duration: .4s;-o-transition-duration: .4s;transition-duration: .4s;"></div>
                                `
        $('body').append($(html));
        this.downloadApp(datas, function () {
            $('body').remove($(html));
        });
    },

    /**
     * 下载安装app
     */
    downloadApp: function (datas, handle) {
        var fileTransfer = new FileTransfer();
        var uri = encodeURI(`${utils.getDomian()}${DOWN_URL}${utils.getProjn()}/${datas.appName}.apk`);
        var fileURL = 'file:///storage/emulated/0/' + datas.appName + '.apk'; //apk保存的目录
        fileTransfer.download(
            uri,
            fileURL,
            function (entry) {
                cordova.plugins.fileOpener2.open(
                    fileURL,
                    'application/vnd.android.package-archive',
                    {
                        error: function () { },
                        success: function () { }
                    }
                );
            },
            function (error) {
                $.toast("请开启储存权限");
            }
        );


        fileTransfer.onprogress = function (event) {
            let num = Math.floor(event.loaded / event.total * 100);
            if (num === 100) {
                $.hidePreloader();
            } else {
                let title = $('.modal-title.update');
                if (title.length)
                    title.text('已下载：' + num + '%')
                else
                    $('.modal-title').text('已下载：' + num + '%');

            }
        }

    },


    /**
     * 是否真机环境
     * @return {boolean}
     */
    isMobile: function () {
        return this.isAndroid() || this.isIos();
    },

    /**
     * 是否android真机环境
     * @return {boolean}
     */
    isAndroid: function () {
        var u = navigator.userAgent;
        return u.indexOf('Android') > -1 || u.indexOf('Adr') > -1; //android终端
    },

    /**
     * 是否ios真机环境
     * @return {boolean}
     */
    isIos: function () {
        var u = navigator.userAgent;
        return !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios终端
    },


    /**
     * 获得app版本号,如0.01
     * @description  对应/config.xml中version的值
     * @returns {Promise<string>}
     */
    getVersionNumber: function () {
        cordova.getAppVersion.getVersionNumber(function (version) {
            return version
        });
    },


    /**
    * 获得app版本号,如10001
    * @description  对应/config.xml中version的值
    * @returns {Promise<string>}
    */
    getVersionCode: function () {
        cordova.getAppVersion.getVersionCode(function (version) {
            return version
        });
    },

    /**
     * 获得app name,如ionic2_tabs
     * @description  对应/config.xml中name的值
     * @returns {Promise<string>}
     */
    getAppName: function () {
        return new Promise((resolve) => {
            cordova.getAppVersion.getAppName().then((value) => {
                resolve(value);
            }).catch(err => {
                this.warn('getAppName:' + err);
            });
        });
    },

    /**
     * 获得app包名/id,如com.kit.com
     * @description  对应/config.xml中id的值
     * @returns {Promise<string>}
     */
    getPackageName: function () {
        return new Promise((resolve) => {
            cordova.getAppVersion.getPackageName().then((value) => {
                resolve(value);
            }).catch(err => {
                this.warn('getPackageName:' + err);
            });
        });
    }
}

export default cordova_utils
