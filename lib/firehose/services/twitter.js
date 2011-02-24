/** 
 * Twitter service class 
 */
const _ = require('underscore')._;
const Backbone = require('backbone');
const { OAuthService } = require('firehose/services/index');

var TwitterService = exports.TwitterService = OAuthService.extend({

    defaults: _.extend({}, OAuthService.prototype.defaults, {
        consumer_key: '1qd5q4JlJBeQG4tIGEOwQ',
        consumer_secret: 'mRlVsmFhcYm4SPbPVDWsl4v3ncAWxtcXuVWU7h16Sc',
        base_url: 'https://api.twitter.com/',
        api_base_path: '1/',
        oauth_base_path: 'oauth/',
    }),

    initialize: function (attributes, options) {
        var base_url = this.get('base_url');
        this.set({
            api_base_url: base_url + this.get('api_base_path'), 
            oauth_base_url: base_url + this.get('oauth_base_path') 
        }, { silent: true });

        OAuthService.prototype.initialize.call(this, attributes, options);
    }

});
