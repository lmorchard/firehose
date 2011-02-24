/**
 * Base service classes
 */
const _ = require('underscore')._;
const Backbone = require('backbone');
const OAuthSimple = require("OAuthSimple").OAuthSimple;
const Request = require('request').Request;
const flow = require('flow');

/** Base class for all services */
var BaseService = exports.BaseService = Backbone.Model.extend({
    authorize: function (credentials, done_cb, err_cb) { /* No-op */ }
});

/** Base class for service authenticated via HTTP Basic Auth */
var BasicAuthService = exports.BasicAuthService = BaseService.extend({
});

/** Base class for service authenticated via username and remote key (eg. FriendFeed) */
var RemoteKeyService = exports.RemoteKeyService = BaseService.extend({
});

/** 
 * Base class for service authenticated via OAuth 
 */
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
        authorize_path: 'authorize',
        authorized: false
    },

    initialize: function (attributes, options) {
        var oauth_base_url = this.get('oauth_base_url');
        this.set({
            request_token_url: oauth_base_url + this.get('request_token_path'),
            authorize_url: oauth_base_url + this.get('authorize_path'),
            access_token_url: oauth_base_url + this.get('access_token_path')
        }, { silent: true });

        BaseService.prototype.initialize.call(this, attributes, options);

        this.oauth = OAuthSimple(
            this.get('consumer_key'), 
            this.get('consumer_secret')
        ); 
    },

    getAuthorizationUrl: function (done_cb, err_cb) {
        var $this = this;
        $this.oauth.reset();
        var req = Request({
            url: $this.oauth.sign({
                path: $this.get('request_token_url'),
                parameters: { 
                    force_login:'true',
                    oauth_callback:'oob' 
                }
            }).signed_url,
            onComplete: function (resp) {
                var auth_params = $this.auth_params = 
                    $this.oauth._parseParameterString(resp.text);
                var auth_url = $this.oauth.sign({
                    path: $this.get('authorize_url'),
                    parameters: { 
                        oauth_token: auth_params.oauth_token, 
                        oauth_callback: 'oob' 
                    }
                }).signed_url;

                if (200 == resp.status) {
                    done_cb(auth_url);
                } else {
                    err_cb(req, resp);
                }
            }
        }).get();
    },

    authorize: function (credentials, done_cb, err_cb) {
        var $this = this;
        $this.oauth.reset();
        var req = Request({
            url: $this.oauth.sign({
                path: $this.get('access_token_url'),
                parameters: { 
                    oauth_token: $this.auth_params.oauth_token, 
                    oauth_verifier: credentials.pin 
                },
                signatures: { 
                    'oauth_token_secret': $this.auth_params.oauth_token_secret 
                }
            }).signed_url,
            onComplete: function (resp) {
                if (200 == resp.status) {
                    var authorized = $this.oauth._parseParameterString(resp.text);
                    $this.set({ 'authorized': authorized });
                    done_cb(authorized);
                } else {
                    err_cb(req, resp);
                }
            }
        }).get();
    }

});

/** 
 * Twitter service class 
 */
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

/** 
 * Status.net service class 
 */
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
