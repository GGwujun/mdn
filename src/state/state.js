/*-----------------------------------------------------------------------------
* @Description: 状态 
* @date		2016.09.23
* ---------------------------------------------------------------------------*/
import utils from '../util/utils';
import net from '../net/net';

function stateAjax(obj, handle, isplace = false, isRouter = true) {
	var that = obj;
	var dateFlag = utils.cacheTime ? new Date().getUTCMinutes() - utils.cacheTime : 20;
	if (dateFlag > 18) {
		net.ajax({
			url: '/csb/auth/?cmd=staterole',
			type: 'get',
			dataType: 'json',
			cache: true,
			callback: function (data) {
				var conf = $(that).attr('cm-state') ? utils.StrToJson($(that).attr('cm-state')) : {};
				if (conf)
					conf.href = conf.href ? conf.href : (utils.isWeiXin() ? 'bind' : 'login');
				if (data.success) {
					utils.cacheTime = new Date().getUTCMinutes()
					utils._role = data.data[0];
					if (conf && conf.role) {
						if (conf.role !== parseInt(utils._role.level)) {
							if (isRouter)
								$.router[isplace ? 'replacePage' : 'loadPage']('#' + conf.href, true);
							else
								handle && handle(true)
						} else {
							conf && conf.callback && conf.callback();
							handle && handle(true);
						}
					} else {
						conf && conf.callback && conf.callback();
						handle && handle(true);
					}
				} else {
					if (conf && (!conf.role)) {
						if (isRouter)
							$.router[isplace ? 'replacePage' : 'loadPage']('#' + conf.href, true);
						else
							handle && handle(true)
					} else {
						handle && handle(true);
					}
					conf && conf.callback && conf.callback();
				}
			}
		})
	} else {
		var conf = $(that).attr('cm-state') ? utils.StrToJson($(that).attr('cm-state')) : {};
		if (conf)
			conf.href = conf.href ? conf.href : (utils.isWeiXin() ? 'bind' : 'login');

		if (conf && conf.role) {
			if (conf.role !== parseInt(utils._role.level)) {
				if (isRouter)
					$.router[isplace ? 'replacePage' : 'loadPage']('#' + conf.href, true);
				else
					handle && handle()
			} else {
				conf && conf.callback && conf.callback();
				handle && handle();
			}
		} else {
			conf && conf.callback && conf.callback();
			handle && handle();
		}
	}
};

/**
 * container 分为以下几种情况
 * 元素级别：这种情况只有一种，那就是a标签路由跳转上配置了权限
 * 页面级别：这种情况只有一种，就是路由取页面初始化时检测，防止直接通过页面地址跳转
 * 
 * @param {*selector} container 
 * @param {*function} callbacks 
 * @param {*boolean} isRouter
 */
export default function makeState(container, callbacks, isRouter) {
	if (arguments.length === 1) {//现在已没用
		stateAjax(arguments[0], function (islogin) {
			callbacks && callbacks(islogin);
		});
	} else {
		if (isRouter === false) {//只检测不跳转
			stateAjax(arguments[0], function (islogin) {
				callbacks && callbacks();
			}, false, isRouter);
		} else if (container.attr('cm-state')) {//页面级别的检测
			stateAjax(container[0], function (islogin) {
				callbacks && callbacks(islogin);
			}, true)
		} else {
			stateAjax(container[0], function (islogin) {
				callbacks && callbacks(islogin);
			})
		}
	}
}