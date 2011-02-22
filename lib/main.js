const _ = require('underscore')._;
const backbone = require('backbone');

const self = require('self');
const data = self.data;
const widgets = require("widget");
const tabs = require("tabs");
const OAuthSimple = require("OAuthSimple");

var widget = widgets.Widget({
  label: "Mozilla website",
  contentURL: "http://www.mozilla.org/favicon.ico",
  onClick: function() {
    tabs.open("http://www.mozilla.org/");
  }
});

console.log("The add-on is running.");

exports.main = function (options, callbacks) {

};

exports.onUnload = function (reason) {

};

