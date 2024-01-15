const fetch = require("node-fetch");

const BASE_URL = "http://127.0.0.1:5005";

let THROTTLE = 3000;

let cachedState;
let lastInvocation;

/**
 * fetches the current group state. if this function is invoked
 * within 3s since the last invocation a cached result will be returned.
 * this is since this application only updates the volume of already grouped
 * rooms so there's no need to check the group every time the volume changes.
 *
 * @returns {
 *  { TV: ["Sonos One 1", "Sonos One 2"]... }
 * }
 */
exports.getGroupMembers = async (relevantGroups) => {
  const timeSinceLastInvocation = new Date().getTime() - lastInvocation;

  if (!cachedState || timeSinceLastInvocation > THROTTLE) {
    const response = await fetch(`${BASE_URL}/zones`);
    const json = await response.json();

    cachedState = json.reduce((groups, room) => {
      const {
        coordinator: { roomName },
        members,
      } = room;

      if (!relevantGroups.includes(roomName)) return groups;

      const membersExcludingSelf = members.filter(
        (member) => member.roomName !== roomName
      );
      const memberNames = membersExcludingSelf.map((member) => member.roomName);

      return {
        ...groups,
        [roomName]: memberNames,
      };
    }, {});
  }

  lastInvocation = new Date().getTime();

  return cachedState;
};

/**
 * @members string array, ex: ["Sonos One 1", "Sonos One 2"]
 * @volume string, relative volume change, ex: +6/-2
 */
exports.synchronizeGroupVolume = async (members, volume) => {
  return await Promise.all(
    members.map((roomName) => {
      console.log(`synchronizing volume for ${roomName}`);
      return fetch(`${BASE_URL}/${roomName}/volume/${volume}`);
    })
  );
};

/**
 * @members string array, ex: ["Sonos One 1", "Sonos One 2"]
 * @isMuted boolean, ex: true
 */
exports.synchronizeMute = async (members, isMuted) => {
  return await Promise.all(
    members.map((roomName) => {
      console.log(`synchronizing mute for ${roomName}`);
      return fetch(`${BASE_URL}/${roomName}/${isMuted ? "mute" : "unmute"}`);
    })
  );
};
