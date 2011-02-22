const _ = require('underscore')._;
const backbone = require('backbone');

const file = require('file');
const url  = require("url");
const self = require('self');
const data = self.data;

const OAuthSimple = require("OAuthSimple").OAuthSimple;
const Request = require('request').Request;
const timer = require('timer');

const { BaseService, TwitterService, StatusNetService } = 
    require('firehose/services/BaseService');

/** Ensure the twitter service has correct URLs 
exports.test_twitter_service_urls = function (test) {
    var s = new TwitterService();
    test.assertEqual(s.get('base_url'), 'https://api.twitter.com/');
    test.assertEqual(s.get('request_token_url'), 'https://api.twitter.com/oauth/request_token');
    test.assertEqual(s.get('authorize_url'), 'https://api.twitter.com/oauth/authorize');
    test.assertEqual(s.get('access_token_url'), 'https://api.twitter.com/oauth/access_token');
    test.pass();
};
*/

/** Ensure the status.net service has correct URLs */
exports.test_statusnet_service_urls = function (test) {
    var s = new StatusNetService({ 
        consumer_key: 'c3bbcd2de73e01b0db941e2c48603abb',
        consumer_secret: '1d56294b9f1a3fd702037a800ced93b5',
        site_url: 'https://lmorchard.com/status/'
    });

    for (var k in s.attributes) {
        console.log('INSTANCE ' + k + ' = ' + s.attributes[k]);
    }

    test.assertEqual(s.get('base_url'), 'https://lmorchard.com/status/api/');
    test.assertEqual(s.get('request_token_url'), 'https://lmorchard.com/status/api/oauth/request_token');
    test.assertEqual(s.get('authorize_url'), 'https://lmorchard.com/status/api/oauth/authorize');
    test.assertEqual(s.get('access_token_url'), 'https://lmorchard.com/status/api/oauth/access_token');
    test.pass();
};

/*
exports.test_models = function (test) {
    console.log('---------------------------------------------------------------------------');
    var s = new TwitterService();
    console.log('---------------------------------------------------------------------------');
    //var s = new LmorchardService();
    var s = new StatusNetService({ 
        consumer_key: 'c3bbcd2de73e01b0db941e2c48603abb',
        consumer_secret: '1d56294b9f1a3fd702037a800ced93b5',
        site_url: 'http://mozilla.status.com/status/'
    });
    for (var k in s.attributes) {
        console.log(k + ' = ' + s.attributes[k]);
    }
    console.log('---------------------------------------------------------------------------');

    test.pass();
};
*/
