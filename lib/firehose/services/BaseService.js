/**
 * Base service class
 */
const _ = require('underscore')._;
const Backbone = require('backbone');

/** Base class for all services */
var BaseService = exports.BaseService = Backbone.Model.extend({

    initialize: function (attributes, options) {
        this.set(attributes, {silent : true});
    }

});

/** Base class for service authenticated via HTTP Basic Auth */
var BasicAuthService = exports.BasicAuthService = BaseService.extend({
});

/** Base class for service authenticated via username and remote key (eg. FriendFeed) */
var RemoteKeyService = exports.RemoteKeyService = BaseService.extend({
});

/** Base class for service authenticated via OAuth */
var OAuthService = exports.OAuthService = BaseService.extend({

    defaults: {
        consumer_key: '',
        consumer_secret: '',
        base_url: null,
        oauth_base_url: null,
        request_token_url: null,
        authorize_url: null,
        access_token_url: null,
        request_token_path: 'request_token',
        access_token_path: 'access_token',
        authorize_path: 'authorize'
    },

    initialize: function (attributes, options) {
        for (var k in attributes) {
            console.log('B BASE ' + k + ' = ' + attributes[k]);
        }
        var oauth_base_url = attributes.oauth_base_url;
        attributes.request_token_url = oauth_base_url + attributes.request_token_path;
        attributes.authorize_url = oauth_base_url + attributes.authorize_path;
        attributes.access_token_url = oauth_base_url + attributes.access_token_path;

        for (var k in attributes) {
            console.log('A BASE ' + k + ' = ' + attributes[k]);
        }
        BaseService.prototype.initialize.call(this, attributes, options);
    }

});

/** Twitter service class */
var TwitterService = exports.TwitterService = OAuthService.extend({

    defaults: _.extend({}, OAuthService.prototype.defaults, {
        consumer_key: '1qd5q4JlJBeQG4tIGEOwQ',
        consumer_secret: 'mRlVsmFhcYm4SPbPVDWsl4v3ncAWxtcXuVWU7h16Sc',
        base_url: 'https://api.twitter.com/',
        api_base_path: '1/',
        oauth_base_path: 'oauth/',
    }),

    initialize: function (attributes, options) {
        console.log("MMMM base_url " + attributes.base_url);
        attributes.api_base_url = attributes.base_url + attributes.api_base_path; 
        attributes.oauth_base_url = attributes.base_url + attributes.oauth_base_path; 

        OAuthService.prototype.initialize.call(this, attributes, options);
    }

});

/** Status.net service class */
var StatusNetService = exports.StatusNetService = TwitterService.extend({
    
    defaults: _.extend({}, TwitterService.prototype.defaults, {
        api_base_path: '',
        oauth_base_path: 'oauth/'
    }),

    initialize: function (attributes, options) {
        attributes.base_url = attributes.site_url + 'api/';
        console.log("OOOO base_url " + attributes.base_url);

        TwitterService.prototype.initialize.call(this, attributes, options);
    }

});
