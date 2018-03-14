/*
    单文件上传
*/
import net from '../../net/net';
import app from '../../cordova/index.js';


export function upload() {
	if (utils.isWeiXin()) {
		$('body').delegate('[cm-action-upload]', 'click', function () {
			var that = this;
			var conf = this._conf;
			var elemFile = null;
			if (!conf) {
				conf = utils.StrToJson($(this).attr('cm-action'));
				this._conf = conf;
			}
			var Preview = conf.preview ? conf.preview : false;
			if (this.tagName.toLowerCase() == 'img') {
				elemFile = this;
			}
			else
				elemFile = $(that).siblings('img.templateImg');

			if (Preview) {
				if ($(Preview).length == 1) {
					elemFile = $(Preview)[0];
				}
			}
			if(that._conf.sourceType){
				if(typeof(that._conf.sourceType) === 'string'){
					that._conf.sourceType = that._conf.sourceType.split(',');
				}
			}else{
				that._conf.sourceType = ['album','camera'];
			}
			wx.chooseImage({
				count: that._conf.count ? that._conf.count : 1, // 默认9
				sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
				sourceType: that._conf.sourceType, // 可以指定来源是相册还是相机，默认二者都有
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
		})
	}
	else if (utils.isPc()) {
		$('body').delegate('[cm-action-upload]', 'click', function () {
			$('input.uploadInput').remove();
			var conf = this._conf;
			var that = $(this);
			if (!conf) {
				conf = utils.StrToJson($(this).attr('cm-action'));
				this._conf = conf;
			}
			var Preview = conf.preview ? conf.preview : false;

			var elemFile = $('input[type="file"].uploadInput');
			if (elemFile.length == 0) {
				elemFile = $('<input type="file" class="uploadInput" style="width: 0px;height: 0px;opacity: 0;display:none;filter:alpha(opacity=0)"/>').appendTo($(that).parent());
			}
			if (this.tagName.toLowerCase() == 'img')
				elemFile.get(0)._img = this;
			else if (Preview) {
				if ($(Preview).length == 1) {
					elemFile.get(0)._img = $(Preview);
				}
				else
					elemFile.get(0)._img = $(that).find('img');
			}
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
		});
		$('body').delegate('.closeImg', 'click', function () {
			var _delConf = utils.StrToJson($(this).closest('.fileUpre').prevAll('[cm-action-upload]').attr('cm-action'));
			var _delback = _delConf.delback;
			var Allval = $(this).closest('.fileUpre').prevAll('input[type="hidden"].templateImg').val();
			var val = $(this).closest('.fileUpre').find('img').attr('src');
			var mark = $(this).closest('.fileUpre').find('img').attr('mark');
			var titleVal = $(this).closest('.fileUpre').attr('title');
			var title = $(this).closest('.fileUpre').prevAll('input[type="hidden"].templateImg').nextAll('input[type="hidden"]').val();
			if (val || mark) {
				if (!val)
					val = mark;
				var AllvalNew = inArray(Allval, val);
				if (title) {
					var titleNew = inArray(title, titleVal);
					$(this).closest('.fileUpre').prevAll('input[type="hidden"].templateImg').next('input[type="hidden"]').val(titleNew);
				}
				$(this).closest('.fileUpre').prevAll('input[type="hidden"].templateImg').val(AllvalNew);
			}
			$(this).closest('.fileUpre').remove();
			if (_delback)
				_delback && _delback();
			else if (_delConf.uploadDel)
				window[_delConf.uploadDel]();
		});
		function inArray(Allval, val) {
			Allval = Allval.split(',');
			var arr = '';
			Allval = $.grep(Allval, function (value) {
				if (value != val) {
					if (arr)
						arr += ',' + value;
					else
						arr += value;
				}
			});
			return arr;
		}
	}
	else {
		$(document).on('click', '[cm-action-upload]', function () {
			var conf = this._conf;
			var that = this;
			var that = $(this);
			if (!conf) {
				conf = utils.StrToJson($(this).attr('cm-action'));
				this._conf = conf;
			}
			var Preview = conf.preview ? conf.preview : false;
			var max = conf.max ? conf.max : 1;
			var actions = conf.actions ? conf.actions : [{ text: '相册', color: 'danger', type: 1 }, { text: '相机', color: 'danger', type: 2 }];
			if(!conf.noSrc){
				var elemFile = null;
				if (this.tagName.toLowerCase() == 'img') {
					elemFile = this;
				}
				else
					elemFile = $(that).siblings('img.templateImg');

				if (Preview) {
					if ($(Preview).length == 1) {
						elemFile = $(Preview)[0];
					}
				}
			
			
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
				
			}else{
				if (actions[0].type == 1) {
					app.uploadpPictures.choosePhoto(function (dataimg) {
						saveimg($(elemFile), conf, dataimg);
					})
				}
				
				if (actions[0].type == 2) {
					app.uploadpPictures.takePhoto(function (dataimg) {
						saveimg($(elemFile), conf, dataimg);
					})
				}
			}
		});
	}
}

function saveimg(elemFile, conf, dataimg) {
	var max = conf.max ? conf.max : 1;
	var img = elemFile[0];
	var result = dataimg;
	var _fileType = ['img'];
	var _typeImgIcon;
	var uploadurl = utils.getDomian() + '/csb/uploads/';
	if(!conf.noSrc){
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
	}
	
	if (conf.uploadback && !conf.callback)
		window[conf.uploadback](uploadurl + result);

	conf.callback && conf.callback(uploadurl + result);
}

function checkImg(el, conf) {
	if (el.parent().find('.fileUpre').length >= conf.max) {
		$.toast('最多可上传' + conf.max + '张图片');
		return false;
	} else {
		return true;
	}
}