"use strict";

var utils = require("../utils");
var log = require("npmlog");

module.exports = function(defaultFuncs, api, ctx) {
  return function createNewGroup(participantIDs, groupTitle, callback) {
    if (!callback && !groupTitle) {
      throw { error: "createNewGroup: need callback" };
    }

    if (utils.getType(groupTitle) == "Function") {
      callback = groupTitle;
      groupTitle = null;
    }

    if (utils.getType(participantIDs) !== "Array") {
      throw { error: "createNewGroup: participantIDs should be an array." };
    }

    if (participantIDs.length < 2) {
      throw { error: "createNewGroup: participantIDs should have at least 2 IDs." };
    }

    participantIDs.map(function(x) { 
      return {
        fbid: x.toString() 
      };
    });
    participantIDs.push({fbid: ctx.userID});

    var form = {
      fb_api_caller_class: "RelayModern",
      fb_api_req_friendly_name: "MessengerGroupCreateMutation",
      av: ctx.userID,
      //This doc_id is valid as of January 11th, 2020
      doc_id: "577041672419534",
      variables: JSON.stringify({
        input: {
          entry_point: "jewel_new_group",
          actor_id: ctx.userID,
          participants: participantIDs,
          client_mutation_id: "0",
          thread_settings: {
            name: groupTitle,
            joinable_mode: "PRIVATE",
            thread_image_fbid: null
          }
        }
      })
    };

    defaultFuncs
      .post(
        "https://www.facebook.com/api/graphql/",
        ctx.jar,
        form
      )
      .then(utils.parseAndCheckLogin(ctx, defaultFuncs))
      .then(function(resData) {
        if (resData.errors) {
          throw resData;
        }
        return callback(null, resData.data.messenger_group_thread_create.thread.thread_key.thread_fbid);
      })
      .catch(function(err) {
        log.error("createNewGroup", err);
        return callback(err);
      });
  };
};
