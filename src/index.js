// 依赖的插件和库
import $ from 'jquery'
import Vue from 'vue';

import '../node_modules/pageui/dist/css/pageui.css'
import '../node_modules/pageui/dist/js/pageui.js'



//全局对象
import utils from './util/utils.js'
import net from './net/net.js'
import page from './page/index.js'
import ent from './ent/ent.js'
import makeState from './state/state.js'
import Formcheck from './formcheck/index.js'
import uploadMin from './action/file/imgUp.js'
import mobeditor from 'mobeditor'

window.utils = utils;
window.net = net;
window.page = page;
window.page.ent = ent;
window.makeState = makeState;
window.Formcheck = Formcheck;
window.mobeditor = mobeditor;
// window.uploadMin = uploadMin;
window.Vue = Vue;

$('body').on('click', '[cm-state]', function () {
    var conf = $(this).attr('cm-state') ? utils.StrToJson($(this).attr('cm-state')) : {};
    makeState($(this), function () {
        conf.callback && conf.callback();
    });
})
