define(function(require) {

    var utils = require('utils');

    var viewConfig = {
        eventMap: function() {
            return {};
        },

        initialize: function() {
            var self = this;
            var indexView = utils.loadCompiledPage('zxsqlIndexPage', require);
            this.$rootElement.html(indexView.render({}), true);

            zeroSqlOnline.init('#zxsqlContainer');
        }
    };

    return viewConfig;
});
