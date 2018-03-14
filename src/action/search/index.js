import utils from '../../util/utils';
import action from '../index';

const search = {
    init: function (handle) {
        var el = $('body').find('[cm-list][search]')
        var config = $('body').find('[cm-list][search]').attr('search');
        config = utils.StrToJson(config);
        if (!el[0]._config) {
            el[0]._config = config;
        }

        if (el[0]._config) {
            var list = $(el[0]._config.target);
            if (list.get(0) && list.get(0)._conf) {
                el[0]._flt = list[0]._conf.flt ? list[0]._conf.flt : {};
            }
        }
        var actives = config.active;
        $('body').delegate(config.confirmBtn, 'click', function () {
            var ele = el.find('.' + actives);
            var flt = utils.CloneJson(el[0]._flt);
            var _el = $(el[0]._config.target)[0];
            ele.each(function () {
                var value = $(this).attr('searchVal');
                var flag = $(this).attr('searchFlag');
                var _filter_type = $(this).attr('searchType');

                flt[flag] = {
                    value: value,
                    type: _filter_type
                };

            })

            page.conf(_el, {
                flt: flt,
                page: 1
            });
            _el._page = 1;
            _el._refreshInfinite = null;
            page.reload(_el);

            //重新开启上啦加载
            action.InfiniteScroll(_el)
            handle && handle()
        })

        $('body').delegate(config.resetBtn, 'click', function () {
            el.find('.' + actives).removeClass(actives);
            var flt = utils.CloneJson(el[0]._flt);
            var _el = $(el[0]._config.target)[0];
            page.conf(_el, {
                flt: flt,
                page: 1
            });
            _el._page = 1;
            _el._refreshInfinite = null;
            page.reload(_el);

            //重新开启上啦加载
            action.InfiniteScroll(_el)

            handle && handle()
        })
    }
}

export default search
