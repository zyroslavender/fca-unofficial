"use strict";

var utils = require("../utils");
var log = require("npmlog");

module.exports = function(defaultFuncs, api, ctx) {
  return function handleFriendRequest(userID, accept, callback) {
    if (utils.getType(accept) !== "Boolean") {
      throw {
        error: "Please pass a boolean as a second argument."
      };
    }

    if (!callback) {
      callback = function() {};
    }

    var form = {
      viewer_id: ctx.userID,
      "frefs[0]": "jwl",
      floc: "friend_center_requests",
      ref: "/reqs.php",
      action: (accept ? "confirm" : "reject")
    };

    defaultFuncs
      .post(
        "https://www.facebook.com/requests/friends/ajax/",
        ctx.jar,
        form
      )
      .then(utils.parseAndCheckLogin(ctx, defaultFuncs))
      .then(function(resData) {
        if (resData.payload.err) {
          throw {
              err: resData.payload.err
          };
        }

        return callback();
      })
      .catch(function(err) {
        log.error("handleFriendRequest", err);
        return callback(err);
      });
  };
};
