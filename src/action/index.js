
import { fileopen } from './file/open'
import { filesave } from './file/save'
import { upload } from './file/upload'

import { deletes } from './form/delete'
import { open } from './form/open'
import { save } from './form/save'
import data from './form/data'
import { load } from './form/load'
// import { remove } from './form/remove'
import { add } from './form/add'
// import { postList } from './form/postList'
// import { saveList } from './form/saveList'
// import { approve } from './form/approve'
import { post } from './form/post'
import { logout } from './auth/logout'
import { signin } from './auth/signin'
import { signup } from './auth/signup'
import { changePass } from './auth/changePass'
import search from './search/index'
import filt from './filt/index'
import wechatPay from './pay/wechatPay'



const action = {
	file: {
		open: fileopen,
		save: filesave,
		upload: upload
	},
	auth: {
		logout: logout,
		signin: signin,
		signup: signup,
		changePass: changePass
	},
	pay: {
		wechatPay: wechatPay
	},
	form: {
		open: open,
		save: save,
		deletes: deletes,
		load: load,
		//remove: remove,
		add: add,
		//saveList: saveList,
		//approve: approve,
		post: post
	},
	//postList: postList,
	data: data,
	init: function (container, flag, handle) {
		container.find('[cm-action]').each(function (index, item) {
			if (flag || $(this).closest('[cm-data]').length === 0) {
				var conf = $(this).attr('cm-action');
				conf = utils.StrToJson(conf);
				this._conf = conf;
				var $ngroup = $(this).closest('[cm-group]');
				if ($ngroup.length == 1) {
					$ngroup[0]._conf = conf;
				}
				var type = conf.type;
				$(this).attr('cm-action-' + type, '');
				// if (this._conf.inited) {  //为formbuilder 服务
				// 	var that = this;
				// 	setTimeout(function () {
				// 		$(that).click();
				// 	}, 100);
				// }
			}
			if (index + 1 === container.find('[cm-action]').length)
				handle && handle();
		})

	},
	ready: function (handle) {
		handle && handle();
	},
	EnableButton: function (btn) {
		if (btn.length > 0)
			setTimeout(function () {
				btn.removeAttr('disabled');
				btn.each(function () {
					$(this).html(this._oldText);
				})
			}, 500);
	},
	DisableButton: function (btn, waiting) {
		if (btn.length > 0) {
			btn.attr('disabled', 'disabled');
			btn.each(function () {
				if (!this._oldText)
					this._oldText = $(this).html();
			})
			btn.html(waiting ? waiting : '请稍候...');
		}
	},
	target: function (conf, data) {
		if (conf.target) {
			var target = conf.target.split('&');
			if (target.length > 1) {
				$('#' + target[0]).find(target[1]).text(data.data[0][target[2]])
			} else if (target.length = 1) {
				$('#' + target[0])[0].savereload = true;
			}
		}
	},
	initAction: function () {
		action.file.open();
		action.file.save();
		action.file.upload();
		action.form.open();
		action.form.save();
		action.form.deletes();
		action.form.load();
		//action.form.remove();
		action.form.add();
		//action.form.approve();
		action.form.post();
		action.auth.logout();
		action.auth.signin();
		action.auth.signup();
		action.auth.changePass();
		window.search = search;
		window.filt = filt;
		action.pay.wechatPay();
	}
}

export default action
