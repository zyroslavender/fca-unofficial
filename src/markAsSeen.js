"use strict";

var utils = require("../utils");
var log = require("npmlog");

module.exports = function(defaultFuncs, api, ctx) {
  return function markAsRead(seen_timestamp, callback) {
    if (utils.getType(seen_timestamp) == "Function" ||
      utils.getType(seen_timestamp) == "AsyncFunction") {
        seen_timestamp = Date.now();
    }

    if (!callback) {
      callback = function() {};
    }

    var form = {
      seen_timestamp: seen_timestamp
    };

    defaultFuncs
      .post(
        "https://www.facebook.com/ajax/mercury/mark_seen.php",
        ctx.jar,
        form
      )
      .then(utils.saveCookies(ctx.jar))
      .then(utils.parseAndCheckLogin(ctx, defaultFuncs))
      .then(function(resData) {
        if (resData.error) {
          throw resData;
        }

        return callback();
      })
      .catch(function(err) {
        log.error("markAsSeen", err);
        if (utils.getType(err) == "Object" && err.error === "Not logged in.") {
          ctx.loggedIn = false;
        }
        return callback(err);
      });
  };
};
