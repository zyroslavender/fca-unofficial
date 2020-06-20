"use strict";

var utils = require("../utils");
var log = require("npmlog");

module.exports = function(defaultFuncs, api, ctx) {
  return function markAsRead(threadID, read, callback) {
    if (utils.getType(read) === 'Function' || utils.getType(read) === 'AsyncFunction') {
      callback = read;
      read = true;
    }
    if (read == undefined) {
      read = true;
    }
    
    var resolveFunc = function(){};
    var rejectFunc = function(){};
    var returnPromise = new Promise(function (resolve, reject) {
      resolveFunc = resolve;
      rejectFunc = reject;
    });

    if (!callback) {
      callback = function (err, friendList) {
        if (err) {
          return rejectFunc(err);
        }
        resolveFunc(friendList);
      };
    }

    var form = {};

    if (typeof ctx.globalOptions.pageID !== 'undefined') {
      form["source"] = "PagesManagerMessagesInterface";
      form["request_user_id"] = ctx.globalOptions.pageID;
    }

    form["ids[" + threadID + "]"] = read;
    form["watermarkTimestamp"] = new Date().getTime();
    form["shouldSendReadReceipt"] = true;
    form["commerce_last_message_type"] = "";
    //form["titanOriginatedThreadId"] = utils.generateThreadingID(ctx.clientID);

    defaultFuncs
      .post(
        "https://www.facebook.com/ajax/mercury/change_read_status.php",
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
        log.error("markAsRead", err);
        if (utils.getType(err) == "Object" && err.error === "Not logged in.") {
          ctx.loggedIn = false;
        }
        return callback(err);
      });

    return returnPromise;
  };
};
