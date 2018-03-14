import net from '../../net/net';

export function logout() {
    $('body').delegate('.state-logout', 'click', function () {
        var href = $(this).attr('_href');
        Logout(href);
    });
}


function Logout(href) {
    net.ajax({
        type: 'get',
        cmd: 'auth',
        masked: true,
        data: { cmd: 'clr' },
        dataType: 'json',
        callback: function (data) {
            if (data.success) {
                href = href ? href : 'login';
                utils._role = {};
                $.router.replacePage('#' + href, true);
            }
            else {
                utils.Alert(net.getErrorMessage(data));
            }
        },
        error: function () {
            utils.Alert('退出失败!');
        }
    })
}