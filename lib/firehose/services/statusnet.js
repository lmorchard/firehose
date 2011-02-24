/** 
 * Status.net service class 
 */
const _ = require('underscore')._;
const Backbone = require('backbone');
const { TwitterService } = require('firehose/services/twitter');

var StatusNetService = exports.StatusNetService = TwitterService.extend({
    
    defaults: _.extend({}, TwitterService.prototype.defaults, {
        api_base_path: '',
        oauth_base_path: 'oauth/'
    }),

    initialize: function (attributes, options) {
        this.set({
            base_url: this.get('site_url') + 'api/'
        }, { silent: true });

        TwitterService.prototype.initialize.call(this, attributes, options);
    }

});
