import utils from '../../util/utils';
function filtStart(el, target, handle) {
    var orderby = $(el).attr('data-orderby');
    var sort = $(el).attr('data-class');
    target._page = 1;
    page.conf(target, {
        sort: sort,
        ord: orderby,
        page: 1
    });
    page.reload(target, function () {
        // setTimeout(function () {
        //     target.filted = false;
        // }, 1000)
    }, false, true);
    handle && handle()
}
const Filt = {
    init: function (handle) {
        var el = $('body').find('[cm-list][filt]')
        var config = $('body').find('[cm-list][filt]').attr('filt') ? utils.StrToJson($('body').find('[cm-list][filt]').attr('filt')) : {};
        if (!el[0]._config) el[0]._config = config;

        var { target, filtClass } = el[0]._config;

        if ($(target).get(0) && $(target).get(0)._conf) {
            el[0]._flt = $(target)[0]._conf.flt ? $(target)[0]._conf.flt : {};
        }

        $('body').on('click', filtClass, function (e) {
            if (!$(target)[0].filted) {
                $(target)[0].filted = true;
                e.preventDefault();
                $(this).off('click');
                var _el = $(target)[0];
                var data_type = $(this).attr('data-type') ? $(this).attr('data-type').split(',') : ['desc', 'asc'];
                var isActive = config[$(this).hasClass(config[data_type[0]]) ? data_type[0] : data_type[1]];
                if (isActive) {//
                    if (!(data_type.length === 1)) {
                        $(this).attr('data-orderby', $(this).hasClass(config[data_type[0]]) ? '1' : '0');
                        $(this).addClass(config[$(this).hasClass(config[data_type[0]]) ? data_type[1] : data_type[0]]);
                        $(this).removeClass(isActive);
                        $(this).siblings().removeClass(config[data_type[0]] + ' ' + config[data_type[1]]);
                    }
                } else {
                    $(this).addClass(config[data_type[0]]);
                    $(this).removeClass(config[data_type[1]]);
                    $(this).attr('data-orderby', '0')
                    $(this).siblings().removeClass(config[data_type[0]] + ' ' + config[data_type[1]]);
                }
                filtStart(this, _el, handle);
            }
        })
    }
}
export default Filt