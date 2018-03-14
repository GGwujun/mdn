
function jQuery(selector) {
    return new jQuery.fn.init(selector);
};

jQuery.fn = jQuery.prototype = {
    init: function (selector) {
        var match, elem;

        if (!selector) {
            return this;
        }

        // Handle HTML strings
        if (typeof selector === "string") {
            // HANDLE: $(DOMElement)
        } else if (selector.nodeType) {
            $(selector).html(htmlString);
            // HANDLE: $(function)
            // Shortcut for document ready
        }

        if (selector.selector !== undefined) {
            this.selector = selector.selector;
        }

        return jQuery.makeArray(selector, this);
    },

}