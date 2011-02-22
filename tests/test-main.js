const main = require("main");

const _ = require('underscore')._;
const backbone = require('backbone');

const file = require('file');
const url  = require("url");
const self = require('self');
const data = self.data;

const OAuthSimple = require("OAuthSimple").OAuthSimple;
const Request = require('request').Request;
const timer = require('timer');

const { BaseService, TwitterService, StatusNetService, LmorchardService } = 
    require('firehose/services/BaseService');

var base_url, consumer_key, consumer_secret, oauth_base_url, api_base_url, oauth_data
var oauth_acct = {};

var use_service = 'twitter';

if ('twitter' == use_service) {

    base_url        = 'https://api.twitter.com';
    consumer_key    = '1qd5q4JlJBeQG4tIGEOwQ';
    consumer_secret = 'mRlVsmFhcYm4SPbPVDWsl4v3ncAWxtcXuVWU7h16Sc';
    oauth_base_url  = base_url + '/oauth/';
    api_base_url    = base_url + '/1/';

} else if ('lmorchard' == use_service) {

    base_url        = 'http://lmorchard.com/status/api';
    consumer_key    = 'c3bbcd2de73e01b0db941e2c48603abb';
    consumer_secret = '1d56294b9f1a3fd702037a800ced93b5';
    oauth_base_url  = base_url + '/oauth/';
    api_base_url    = base_url + '/';

} else {
    console.error("NO SUCH SERVICE");
}

var request_token_url = oauth_base_url + 'request_token';
var access_token_url  = oauth_base_url + 'access_token';
var authorize_url     = oauth_base_url + 'authorize';

var update_url = api_base_url + 'statuses/update.json';

var oauth = OAuthSimple(consumer_key, consumer_secret);

var oauth_login_fn = "test/oauth_login_"+use_service+".txt";

exports.test_oauth_login = function (test) {

    // Check for a previously-saved OAuth login
    if (file.exists(url.toFilename(data.url(oauth_login_fn)))) {
        console.log("OAuth login cached, so skipping login test.");
        return test.pass();
    }

    var oauth_params = null;
    var oauth_acct = null;

    var chain = [

        function () {
            
            var req = Request({
                url: OAuthSimple(consumer_key, consumer_secret).sign({
                    path: request_token_url,
                    parameters: { 
                        force_login: 'true', 
                        oauth_callback: 'oob' 
                    }
                }).signed_url,
                onComplete: function (resp) {
                    console.debug('REQUEST TOKEN URL ' + req.url);
                    chain.shift()(resp);
                }
            }).get();

        }, function (resp) {

            test.assertEqual(resp.status, "200", 'Request token request should work');
            console.debug("REQUEST TOKEN RESP " + resp.text);

            var oauth = OAuthSimple(consumer_key, consumer_secret);
            oauth_params = oauth._parseParameterString(resp.text);

            var auth_url = oauth.sign({
                path: authorize_url,
                parameters: { 
                    oauth_token: oauth_params.oauth_token, 
                    oauth_callback: 'oob' 
                }
            }).signed_url;

            console.log("Visit this authorization URL and save the pin in data/test/pin.txt\n" + auth_url);

            var wait_for_pin = function () {
                if (!file.exists(url.toFilename(data.url('test/pin.txt')))) {
                    console.debug("Waiting for pin...");
                    timer.setTimeout(wait_for_pin, 3000);
                } else {
                    chain.shift()(resp);
                }
            };
            wait_for_pin();

        }, function () {
            
            // Read the PIN and delete it.
            var pin = data.load('test/pin.txt').trim();
            file.remove(url.toFilename(data.url('test/pin.txt')))

            console.debug("Found PIN '" + pin + "'");
            test.assert(!!pin, "PIN should be defined");

            var req = Request({
                url: OAuthSimple(consumer_key, consumer_secret).sign({
                    path: access_token_url,
                    signatures: {
                        'oauth_token_secret': oauth_params.oauth_token_secret,
                    },
                    parameters: { 
                        oauth_token: oauth_params.oauth_token, 
                        oauth_verifier: pin 
                    }
                }).signed_url,
                onComplete: function (resp) {
                    console.debug('ACCESS TOKEN URL ' + req.url);
                    chain.shift()(resp);
                }
            }).get();

        }, function (resp) {
            test.assertEqual(resp.status, "200", 'Access token request should work');

            var oauth = OAuthSimple(consumer_key, consumer_secret);
            oauth_acct = oauth._parseParameterString(resp.text);

            var fout = file.open(url.toFilename(data.url(oauth_login_fn)), 'w');
            fout.write(JSON.stringify(oauth_acct));
            fout.close();

            console.debug('Wrote OAuth login to "'+oauth_login_fn+'"');

            test.pass();
        }

    ];
    chain.shift()();

    test.waitUntilDone(60000);
};

exports.test_post_update = function (test) {

    var oauth = OAuthSimple(consumer_key, consumer_secret);

    var oauth_data = data.load(oauth_login_fn);
    console.debug("OAUTH LOGIN '" + oauth_data + "'");
    oauth_acct = JSON.parse(oauth_data);

    var chain = [

        function () {

            var oauth = OAuthSimple(consumer_key, consumer_secret);
            var status = 'Testing 1 2 3 ' + (new Date()).getTime();

            var auth_header = oauth.getHeaderString({
                action: 'POST',
                parameters: {
                    oauth_version: '1.0',
                    status: status
                },
                signatures: {
                    access_token: oauth_acct.oauth_token, 
                    access_secret: oauth_acct.oauth_token_secret,
                },
                path: update_url
            });
            
            var secretKey = oauth._oauthEscape(oauth._secrets.shared_secret)+'&'+
                oauth._oauthEscape(oauth._secrets.oauth_secret);

            var sigString = oauth._oauthEscape(oauth._action)+'&'+oauth._oauthEscape(oauth._path)+'&'+oauth._oauthEscape(oauth._normalizedParameters());

            console.debug('SECRET ' + secretKey );
            console.debug('SIGSTR ' + sigString );
            console.debug('HEADER ' + auth_header);

            var req = Request({
                url: update_url,
                headers: { 'Authorization': auth_header },
                content: { status: status },
                onComplete: function (resp) {
                    chain.shift()(resp);
                }
            }).post();

        }, function (resp) {

            console.debug("UPDATE STATUS " + resp.status + " " + resp.statusText);
            console.debug("UPDATE RESP " + resp.text);

            chain.shift()(); 

        }, function () {
            console.log("ALL DONE");
            test.pass();
            test.done();
        }

    ];

    chain.shift()();
    test.waitUntilDone(60000);
};

