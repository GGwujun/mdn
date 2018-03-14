import utils from '../util/utils';
import *as formFun from './lang.js';

const FORM_CHECK_FLAG = 'cm-check';
const SUBMIT_BUTTON = 'submintButton';

class Formcheck {
    constructor(form) {
        this.fields = [];
        this.pauseMessages = false;
        this.config = {};
        this.init(form);
    }

    init(form) {
        let check_forms = $(form).find(`[${FORM_CHECK_FLAG}]`);
        if ($(form).attr(`${SUBMIT_BUTTON}`))
            this.config.submitButton = $(form).attr(`${SUBMIT_BUTTON}`);
        this.config.fields = {};
        for (var index = 0; index < check_forms.length; index++) {
            var element = check_forms[index];
            if (!element._conf) element._conf = $(element).attr(`${FORM_CHECK_FLAG}`) ? utils.StrToJson($(element).attr(`${FORM_CHECK_FLAG}`)) : {};
            this.config.fields[element._conf.selector] = {};
            Object.keys(element._conf).forEach((key) => {
                if (key !== 'selector') {
                    this.config.fields[element._conf.selector][key] = element._conf[key];
                }
            }, self);
        }

        this.bindForm();
    }

    isFunction(obj) {
        return typeof obj === 'function';
    }

    defaultError(error) { //Default error template
        var msgErrorClass = this.config.classes && this.config.classes.message || 'unhappyMessage';
        return $('<span id="' + error.id + '" class="' + msgErrorClass + '" role="alert">' + error.message + '</span>');
    }

    getError(error) { //Generate error html from either this.config or default
        if (this.isFunction(this.config.errorTemplate)) {
            return this.config.errorTemplate(error);
        }
        return this.defaultError(error);
    }

    handleMouseUp() {
        this.pauseMessages = false;
    }
    handleMouseDown() {
        this.pauseMessages = true;
    }
    processField(opts, selector) {
        let self = this;
        var field = $(selector);
        if (!field.length) return;

        selector = field.prop('id') || field.prop('name').replace(['[', ']'], '');
        var error = {
            message: opts.message || '',
            id: selector + '_unhappy'
        };
        var errorEl = $(error.id).length > 0 ? $(error.id) : this.getError(error);
        var handleBlur = function handleBlur() {
            if (!this.pauseMessages) {
                field.testValid();
            } else {
                $(window).one('mouseup', field.testValid);
            }
        };

        this.fields.push(field);
        field.testValid = function testValid(submit) {
            var val, temp;
            var required = field.prop('required') || opts.required;
            var password = field.attr('type') === 'password';
            var arg = self.isFunction(opts.arg) ? opts.arg() : opts.arg;
            var errorTarget = (opts.errorTarget && $(opts.errorTarget)) || field;
            var fieldErrorClass = self.config.classes && self.config.classes.field || 'unhappy';
            var testResult = errorTarget.hasClass(fieldErrorClass);
            var oldMessage = error.message;

            // handle control groups (checkboxes, radio)
            if (field.length > 1) {
                val = [];
                field.each(function (i, obj) {
                    val.push($(obj).val());
                });
                val = val.join(',');
            } else {
                // clean it or trim it
                if (self.isFunction(opts.clean)) {
                    val = opts.clean(field.val());
                } else if (!password && typeof opts.trim === 'undefined' || opts.trim) {
                    val = $.trim(field.val());
                } else {
                    val = field.val();
                }

                // write it back to the field
                field.val(val);
            }

            // check if we've got an error on our hands
            if (submit === true && required === true) {
                testResult = !val.length;
            }
            if ((val.length > 0 || required === 'sometimes') && opts.test) {
                if (self.isFunction(opts.test)) {
                    testResult = opts.test(val, arg);
                }
                else if (typeof opts.test === 'object') {
                    $.each(opts.test, function (i, test) {
                        if (self.isFunction(test)) {
                            testResult = test(val, arg);
                            if (testResult !== true) {
                                return false;
                            }
                        }
                    });
                }

                if (testResult instanceof Error) {
                    error.message = testResult.message;
                }
                else {
                    testResult = !testResult;
                    error.message = opts.message || '';
                }
            }

            // only rebuild the error if necessary
            if (!oldMessage !== error.message) {
                temp = self.getError(error);
                errorEl.replaceWith(temp);
                errorEl = temp;
            }

            if (testResult) {
                errorTarget.addClass(fieldErrorClass).after(errorEl);
                return false;
            } else {
                errorEl.remove();
                errorTarget.removeClass(fieldErrorClass);
                return true;
            }
        };
        field.on(opts.when || this.config.when || 'blur', handleBlur);
    }

    bindForm() {
        let item;
        let self = this;
        function handleSubmit(e) {
            var i, l;
            var errors = false;
            if (self.config.testMode) {
                e.preventDefault();
            }
            for (i = 0, l = self.fields.length; i < l; i += 1) {
                if (!self.fields[i].testValid(true)) {
                    errors = true;
                }
            }
            if (errors) {
                if (self.isFunction(self.config.unHappy)) self.config.unHappy(e);
                return false;
            } else if (self.config.testMode) {
                if (window.console) console.warn('would have submitted');
                if (self.isFunction(self.config.happy)) return self.config.happy(e);
            }
            if (self.isFunction(self.config.happy)) return self.config.happy(e);
        }
        for (item in this.config.fields) {
            if (this.config.fields.hasOwnProperty(item)) {
                this.processField(this.config.fields[item], item);
            }
        }
        $(this.config.submitButton || this).on('mousedown', this.handleMouseDown);
        $(window).on('mouseup', this.handleMouseUp);

        if (this.config.submitButton) {
            $(this.config.submitButton).click(handleSubmit);
        } else {
            this.on('submit', handleSubmit);
        }


    }
}

export default Formcheck