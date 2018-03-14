
function showRetMess(ret) {
	if (ret.data && ret.data.length == 1) {
		var _data = ret.data[0];
		if (_data.length == 1)
			if (_data[0].id == 0) {
				$.alert(_data[0].msg);
				return true;
			}
	}
	return false;
};


const data = {
	save: function (param, handle) {
		var cmd = param._cmd;
		delete param['_cmd'];
		net.ajax({
			cmd: cmd ? cmd : 'data',
			data: param,
			encode: true,
			masked: true,
			dataType: 'json',
			type: 'post',
			callback: function (data) {
				if (data.success) {
					if (showRetMess(data)) {
						if (!handle)
							$.alert('操作成功!');
					}

				}
				else {
					var err = net.getErrorMessage(data);
					utils.error(err);
				}
				handle && handle(data);
			},
			error: function () {
				if (!handle)
					$.alert('提交失败!');
				else
					handle(false);
			}
		})
	},

	load: function (param, handle) {
		var cmd = param._cmd;
		delete param['_cmd'];
		net.ajax({
			cmd: cmd ? cmd : 'data',
			type: 'get',
			masked: true,
			dataType: 'json',
			data: param,
			callback: function (data) {
				if (data.success) {
					handle && handle(data);
				}
				else {
					var err = net.getErrorMessage(data);
					utils.error(err);
				}
			}
		})
	}
}


export default data;