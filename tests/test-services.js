/**
 * Tests for service classes
 */
const _ = require('underscore')._;
const backbone = require('backbone');

const file = require('file');
const url  = require("url");
const self = require('self');
const data = self.data;

const OAuthSimple = require("OAuthSimple").OAuthSimple;
const Request = require('request').Request;
const timer = require('timer');

const flow = require('flow');

const { BaseService, TwitterService, StatusNetService } = 
    require('firehose/services/index');

var oauth_login_fn = "test/oauth_login.txt";

/** 
 * Ensure the twitter service has correct URLs  
 */
exports.test_twitter_service_urls = function (test) {

    var s = new TwitterService();
    
    test.assertEqual(s.get('base_url'), 'https://api.twitter.com/');
    test.assertEqual(s.get('request_token_url'), 'https://api.twitter.com/oauth/request_token');
    test.assertEqual(s.get('authorize_url'), 'https://api.twitter.com/oauth/authorize');
    test.assertEqual(s.get('access_token_url'), 'https://api.twitter.com/oauth/access_token');

    s.getAuthorizationUrl(
        function (url) {
            test.assert(url.indexOf('oauth_token') != -1)
            test.done();
        }, 
        function (resp) { test.fail(); }
    );

    test.waitUntilDone(10000);
};

/** 
 * Ensure the status.net service has correct URLs 
 */
exports.test_statusnet_service_urls = function (test) {

    var s = new StatusNetService({ 
        consumer_key: 'c3bbcd2de73e01b0db941e2c48603abb',
        consumer_secret: '1d56294b9f1a3fd702037a800ced93b5',
        site_url: 'http://lmorchard.com/status/'
    });

    test.assertEqual(s.get('base_url'), 'http://lmorchard.com/status/api/');
    test.assertEqual(s.get('request_token_url'), 'http://lmorchard.com/status/api/oauth/request_token');
    test.assertEqual(s.get('authorize_url'), 'http://lmorchard.com/status/api/oauth/authorize');
    test.assertEqual(s.get('access_token_url'), 'http://lmorchard.com/status/api/oauth/access_token');

    s.getAuthorizationUrl(
        function (url) {
            test.assert(url.indexOf('oauth_token') != -1)
            test.done();
        }, 
        function (resp) { test.fail(); }
    );

    test.waitUntilDone(10000);
};

/** 
 * Run through OAuth authorization for a service, manual intervention required 
 */
exports.test_authorization = function (test) {

    if (file.exists(url.toFilename(data.url(oauth_login_fn)))) {
        console.log("OAuth authorization cached, so skipping test.");
        return test.pass();
    }

    flow.exec(

        function () {
            // Get the authorization URL.
            var $this = this;

            this.service = new StatusNetService({ 
                consumer_key: 'c3bbcd2de73e01b0db941e2c48603abb',
                consumer_secret: '1d56294b9f1a3fd702037a800ced93b5',
                site_url: 'http://lmorchard.com/status/'
            });

            this.service.getAuthorizationUrl(
                function (auth_url) { 
                    $this(auth_url); 
                },
                function (req, resp) { 
                    test.fail("Getting authorization URL failed. " + req.url + ' ' + resp.status); 
                }
            )

        }, function (auth_url) {
            // Ask tester to visit URL, wait for tester to save pin.
            var $this = this;

            console.log("Visit this authorization URL, save pin in " +
                "data/test/pin.txt\n" + auth_url);

            var wait_for_pin = function () {
                if (!file.exists(url.toFilename(data.url('test/pin.txt')))) {
                    console.debug("Waiting for pin...");
                    timer.setTimeout(wait_for_pin, 5000);
                } else {
                    $this();
                }
            };
            wait_for_pin();

        }, function () {
            // Grab pin and use as verifier to complete authorization.
            var $this = this;
        
            var pin = data.load('test/pin.txt').trim();
            file.remove(url.toFilename(data.url('test/pin.txt')))

            console.debug("Found PIN '" + pin + "'");
            test.assert(!!pin, "PIN should be defined");

            this.service.authorize(
                { pin: pin },
                function (authorized) { 
                    $this(authorized); 
                },
                function (req, resp) { 
                    test.fail("Verifying authorization failed. " + req.url + ' ' + resp.status); 
                }
            );

        }, function (authorized) {
            // Save the authorized token and secret.
            var $this = this;
            
            var fout = file.open(url.toFilename(data.url(oauth_login_fn)), 'w');
            fout.write(JSON.stringify(authorized));
            fout.close();

            console.debug('SUCCESS! Cached OAuth token & secret in "'+oauth_login_fn+'"');

            test.done();

        }

    );
    
    test.waitUntilDone(60000);
}

/**
 *
 */

