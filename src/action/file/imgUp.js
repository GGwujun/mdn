import net from '../../net/net';
import app from '../../cordova/index.js';
import utils from '../../util/utils.js'

function wechat() {
    wx.chooseImage({
        count: that._conf.count ? that._conf.count : 1, // 默认9
        sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
        sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
        success: function (res) {
            var localIds = res.localIds; // 返回选定照片的本地ID列表，localId可以作为img标签的src属性显示图片
            if (localIds.length == 0) {
                return false;
            }
            var i = 1, length = localIds.length;
            i = 0;
            var serverId = [];
            function upload() {
                wx.uploadImage({
                    localId: localIds[i],
                    isShowProgressTips: 1, // 默认为1，显示进度提示
                    success: function (res) {
                        i++;
                        serverId.push(res.serverId);
                        if (i < length) {
                            upload();
                        } else {
                            uploadComplete(serverId)
                        }
                    },
                    fail: function (res) {
                        that.error && that.error(res);
                    }
                });
            }
            upload();

            function uploadComplete(serverId) {
                net.ajax({
                    cmd: 'upload',
                    data: { serverId: serverId.join(',') },
                    callback: function (res) {
                        try {
                            var ret = utils.StrToJson(res);
                            $.toast(ret.errmsg);
                        } catch (error) {
                            if (res)
                                saveimg($(elemFile), conf, res);
                            else
                                $.toast('后台错误！')
                        }

                    }
                })
            }
        }
    });
}


function pc() {
    $('input.uploadInput').remove();
    elemFile = $('input[type="file"].uploadInput').length == 0 ? $('<input type="file" class="uploadInput" style="width: 0px;height: 0px;opacity: 0;display:none;filter:alpha(opacity=0)"/>').appendTo($(that).parent()) : $('input[type="file"].uploadInput');
    elemFile.click();
    elemFile.change(function (e) {
        elemFile.unbind('change');
        if (this.files) {
            var file = this.files[0];
            if (file) {
                var filetype = conf.filetype ? conf.filetype : 'img';
                var max = conf.max ? conf.max : 1;
                var videoFormat = new Array('3gp', 'rmvb', 'flv', 'wmv', 'avi', 'mkv', 'mp4', 'mp3', 'wav');
                var filename = file.name;
                filename = filename.substring(filename.lastIndexOf(".") + 1, filename.lastIndexOf(".").length);
                var typeImgShow;
                var _fileType = file.name.split('.');
                var _typeImgIcon;
                if (filetype == 'img' && !/image\/\w+/.test(file.type)) {
                    utils.Alert("文件必须为图片！");
                    return false;
                }
                else if (filetype == 'video' && $.inArray(filename, videoFormat) < 0) {
                    utils.Alert("文件必须为视频！");
                    return false;
                }
                else if (filetype == 'psd' && _fileType[_fileType.length - 1] != 'psd') {
                    utils.Alert("文件必须为PSD文件！");
                    return false;
                }
                if (_fileType[_fileType.length - 1] == 'doc' || _fileType[_fileType.length - 1] == 'docx') {
                    typeImgShow = true;
                    _typeImgIcon = 'File_doc';
                }
                else if (_fileType[_fileType.length - 1] == 'xlsx' || _fileType[_fileType.length - 1] == 'xls') {
                    typeImgShow = true;
                    _typeImgIcon = 'File_xls';
                }
                else if (_fileType[_fileType.length - 1] == 'pptx' || _fileType[_fileType.length - 1] == 'ppt') {
                    typeImgShow = true;
                    _typeImgIcon = 'File_ppt';
                }
                else if (_fileType[_fileType.length - 1] == 'txt' || _fileType[_fileType.length - 1] == 'js' || _fileType[_fileType.length - 1] == 'css' || _fileType[_fileType.length - 1] == 'html') {
                    typeImgShow = true;
                    _typeImgIcon = 'File_txt';
                }
                else if (_fileType[_fileType.length - 1] == 'pdf') {
                    typeImgShow = true;
                    _typeImgIcon = 'File_pdf';
                }
                else if (_fileType[_fileType.length - 1] == 'zip' || _fileType[_fileType.length - 1] == 'rar') {
                    typeImgShow = true;
                    _typeImgIcon = 'File_zip';
                }
                else if (_fileType[_fileType.length - 1] == 'psd') {
                    typeImgShow = true;
                    _typeImgIcon = 'File_psd';
                }
                else if (filetype == 'video') {
                    typeImgShow = true;
                    _typeImgIcon = 'File_video';
                }
                else
                    typeImgShow = false;

                var img = this._img;
                if (!img) {
                    if (that[0].tagName == 'IMG')
                        img = $(that);
                    else if ($(that).siblings('img.templateImg').length > 0)
                        img = $(that).siblings('img.templateImg');
                }
                var reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onloadend = function (e) {
                    if (img) {
                        if (max == 1)
                            $(img).attr('src', this.result);
                    }
                    var fd = new FormData();
                    fd.append('filename', file);
                    net.send({
                        cmd: 'upload',
                        masked: true,
                        formData: fd
                    },
                        function (e) {
                            var result = e.target.responseText;
                            if (img && $(img).length == 1) {
                                if (max > 1)
                                    $(img).parent().append('<div class="fileUpre" title="' + _fileType[0] + '"><img   src="' + utils.getDomian() + '/csb/uploads/' + result + '" cm-action-upload cm-action=' + utils.JsonToStr(conf) + '><a href="javascript:void(0)" class="closeImg glyphicon glyphicon-remove-circle"></a></div>');
                                else
                                    $(img).attr('src', utils.getDomian() + '/csb/uploads/' + result);
                                $(img)[0].callback && img[0].callback();
                            }
                            conf.callback && conf.callback(utils.getDomian() + '/csb/uploads/' + result);
                            if (conf.uploadback && !conf.callback)
                                window[conf.uploadback](utils.getDomian() + '/csb/uploads/' + result);
                            $(that).next('input.uploadInput').remove();

                            if (max > 1) {
                                $(img).hide()
                                var imgstr = [];
                                var temImg = $(img).parent().find('.fileUpre img');
                                if (temImg.length) {
                                    for (var i = 0; i < temImg.length; i++) {
                                        imgstr.push($(temImg[i]).attr('src'));
                                    }
                                    imgstr = imgstr.join(',');
                                }
                                if (imgstr) {
                                    $(img).attr('src', imgstr)
                                }
                            }
                        });
                }
            }
        }
        $('.uploadInput[type="file"]').remove();
    });
    if (navigator.userAgent.indexOf('Edge') > 0 || navigator.userAgent.indexOf('MSIE') > 0 || "ActiveXObject" in window || (navigator.userAgent.indexOf("MSIE 8") > 0 && !window.innerWidth))
        elemFile.change();
}

function apps() {
    var actions = conf.actions ? conf.actions : [{ text: '相册', color: 'danger', type: 1 }, { text: '相机', color: 'danger', type: 2 }];
    var buttons1 = [
        {
            text: '请选择',
            label: true
        }
    ];
    actions.forEach(function (item) {
        buttons1.push(
            {
                text: item.text,
                bold: true,
                color: item.color,
                onClick: function () {
                    if (item.type == 1) {
                        if (checkImg($(elemFile), conf)) {
                            app.uploadpPictures.choosePhoto(function (dataimg) {
                                saveimg($(elemFile), conf, dataimg);
                            })
                        }
                    } else if (item.type == 2) {
                        if (checkImg($(elemFile), conf)) {
                            app.uploadpPictures.takePhoto(function (dataimg) {
                                saveimg($(elemFile), conf, dataimg);
                            })
                        }
                    }
                }
            }
        )
    })
    var buttons2 = [
        {
            text: '取消',
            bg: 'danger'
        }
    ];
    var groups = [buttons1, buttons2];
    $.actions(groups);
}



export default function uploadMin() {
    $('body').delegate('[cm-action-uploads]', 'click', function () {
        var param = {
            platform: utils.isWeiXin() ? 'wechat' : (utils.isPc() ? 'pc' : 'app'),
            fileInput: this,//html file控件
            config: this._conf = this._conf ? this._conf : utils.StrToJson($(this).attr('cm-action')),
            toPreview: (conf.preview ? conf.preview : false) && $(Preview).length == 1 ? $(Preview)[0] : (this.tagName.toLowerCase() == 'img' ? this : $(that).siblings('img.templateImg')),//图片上传目的地
            fileFilter: [], //过滤后的文件数组
            max: 1
        }
        new fileUp(param)
    })
}


let defaultP = {
    platform: null,
    fileInput: null,//html file控件
    config: null,
    toPreview: null,//图片上传目的地
    upButton: null,//提交按钮
    uploadurl: `${utils.getDomian()}/csb/uploads/`, //上传地址
    fileFilter: [], //过滤后的文件数组
    max: 1,
    filter: function (files) {//选择文件组的过滤方法
        return files;
    },
    onSelect: function () { },//文件选择后
    onDelete: function () { },//文件删除后
    onProgress: function () { },//文件上传进度等待
    onSuccess: function () { },//文件上传成功时
    onFailure: function () { }//文件上传失败时
}



class fileUp {
    constructor(param) {
        Object.assign(this, defaultP, param)
        //文件选择控件选择
        if (this.fileInput) {
            this.fileInput.addEventListener("change", function (e) { this.funGetFiles(e); }, false);
        }
    }

    //选中文件的处理与回调
    funDealFiles() {
        for (var i = 0, file; file = this.fileFilter[i]; i++) {
            //增加唯一索引值
            file.index = i;
        }
        //执行选择回调
        this.onSelect(this.fileFilter);
        return this;
    }

    onSelect() {
        var html = '', i = 0;
        //等待载入gif动画
        $("#preview").html('<div class="upload_loading"></div>');
        var funAppendImage = function () {
            file = files[i];
            if (file) {
                var reader = new FileReader()
                reader.onload = function (e) {
                    html = html + '<div id="uploadList_' + i + '" class="upload_append_list"><p><strong>' + file.name + '</strong>' +
                        '<a href="javascript:" class="upload_delete" title="删除" data-index="' + i + '">删除</a><br />' +
                        '<img id="uploadImage_' + i + '" src="' + e.target.result + '" class="upload_image" /></p>' +
                        '<span id="uploadProgress_' + i + '" class="upload_progress"></span>' +
                        '</div>';

                    i++;
                    funAppendImage();
                }
                reader.readAsDataURL(file);
            } else {
                //图片相关HTML片段载入
                $("#preview").html(html);
                if (html) {
                    //删除方法
                    $(".upload_delete").click(function () {
                        ZXXFILE.funDeleteFile(files[parseInt($(this).attr("data-index"))]);
                        return false;
                    });
                    //提交按钮显示
                    $("#fileSubmit").show();
                } else {
                    //提交按钮隐藏
                    $("#fileSubmit").hide();
                }
            }
        };
        //执行图片HTML片段的载人
        funAppendImage();
    }


    onDelete(file) {
        $("#uploadList_" + file.index).fadeOut();
    }

    onProgress(file, loaded, total) {
        var eleProgress = $("#uploadProgress_" + file.index), percent = (loaded / total * 100).toFixed(2) + '%';
        eleProgress.show().html(percent);
    }


    onSuccess(file, response) {
        $("#uploadInf").append(`< p >上传成功，图片地址是:${response}</p>`);
    }

    onFailure(file) {
        $("#uploadInf").append("<p>图片" + file.name + "上传失败！</p>");
        $("#uploadImage_" + file.index).css("opacity", 0.2);
    }


    onComplete() {
        //提交按钮隐藏
        $("#fileSubmit").hide();
        //file控件value置空
        $("#fileImage").val("");
        $("#uploadInf").append("<p>当前图片全部上传完毕，可继续添加上传。</p>");
    }

    /**
     * 生成上传成功的图片
     * @param {*element} elemFile 
     * @param {*object} conf 
     * @param {*string} dataimg 
     */
    saveimg(elemFile, conf, dataimg) {
        var max = conf.max ? conf.max : 1;
        var img = elemFile[0];
        var result = dataimg;
        var _fileType = ['img'];
        var _typeImgIcon;
        var uploadurl = utils.getDomian() + '/csb/uploads/';
        if (img && $(img).length == 1) {
            if (max > 1)
                $(img).parent().append('<div class="fileUpre" title="' + _fileType[0] + '"><img   src="' + uploadurl + result + '" cm-action-upload cm-action=' + utils.JsonToStr(conf) + '><a href="javascript:void(0)" class="closeImg glyphicon glyphicon-remove-circle"></a></div>');
            else {
                $(img).attr('src', uploadurl + result);
            }
            $(img)[0].callback && img[0].callback();
        }


        if (max > 1) {
            $(img).hide()
            var imgstr = [];
            var temImg = $(img).parent().find('.fileUpre img');
            if (temImg.length) {
                for (var i = 0; i < temImg.length; i++) {
                    imgstr.push($(temImg[i]).attr('src'));
                }
                imgstr = imgstr.join(',');
            }
            if (imgstr) {
                $(img).attr('src', imgstr)
            }
        }

        if (conf.uploadback && !conf.callback)
            window[conf.uploadback](uploadurl + result);

        conf.callback && conf.callback(uploadurl + result);
    }

    //删除对应的文件
    funDeleteFile(fileDelete) {
        var arrFile = [];
        for (var i = 0, file; file = this.fileFilter[i]; i++) {
            if (file != fileDelete) {
                arrFile.push(file);
            } else {
                this.onDelete(fileDelete);
            }
        }
        this.fileFilter = arrFile;
        return this;
    }

    /**
     * 检查是否超过最大上传数
     * @param {*element} el 
     * @param {*pbject} conf 
     */
    checkImg(el, conf) {
        if (el.parent().find('.fileUpre').length >= conf.max) {
            $.toast('最多可上传' + conf.max + '张图片');
            return false;
        } else {
            return true;
        }
    }

    //文件上传
    funUploadFile() {
        var self = this;
        if (location.host.indexOf("sitepointstatic") >= 0) {
            //非站点服务器上运行
            return;
        }
        for (var i = 0, file; file = this.fileFilter[i]; i++) {
            (function (file) {
                var xhr = new XMLHttpRequest();
                if (xhr.upload) {
                    // 上传中
                    xhr.upload.addEventListener("progress", function (e) {
                        self.onProgress(file, e.loaded, e.total);
                    }, false);

                    // 文件上传成功或是失败
                    xhr.onreadystatechange = function (e) {
                        if (xhr.readyState == 4) {
                            if (xhr.status == 200) {
                                self.onSuccess(file, xhr.responseText);
                                self.funDeleteFile(file);
                                if (!self.fileFilter.length) {
                                    //全部完毕
                                    self.onComplete();
                                }
                            } else {
                                self.onFailure(file, xhr.responseText);
                            }
                        }
                    };

                    // 开始上传
                    xhr.open("POST", self.url, true);
                    xhr.setRequestHeader("X_FILENAME", encodeURIComponent(file.name));
                    xhr.send(file);
                }
            })(file);
        }
    }
    filter(files) {
        var arrFiles = [];
        for (var i = 0, file; file = files[i]; i++) {
            if (file.type.indexOf("image") == 0) {
                if (file.size >= 512000) {
                    alert('您这张"' + file.name + '"图片大小过大，应小于500k');
                } else {
                    arrFiles.push(file);
                }
            } else {
                alert('文件"' + file.name + '"不是图片。');
            }
        }
        return arrFiles;
    }
}