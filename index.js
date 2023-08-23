const express = require("express");
const bodyParser = require("body-parser");
const {
  getGroupMembers,
  synchronizeGroupVolume,
  synchronizeMute,
} = require("./utils");

/** 'master' speakers */
const releventGroups = ["TV"];

const relevantWebhooks = ["volume-change", "mute-change"];

const startupIdleTime = 3000;
let startTime;

const app = express();

app.use(bodyParser.json());

app.post("/sonos", async (req, res) => {
  // ignore initial webhooks that broadcast initial state
  if (new Date().getTime() - startTime < startupIdleTime) {
    return;
  }

  // early exit if we don't have required data
  if (
    !req.body ||
    !req.body.hasOwnProperty("type") ||
    !req.body.hasOwnProperty("data")
  ) {
    return;
  }

  const { type, data } = req.body;

  // early exit if the change is of a type or group we're not interested in
  if (
    !relevantWebhooks.includes(type) ||
    !releventGroups.includes(data.roomName)
  ) {
    return;
  }

  console.log("webhook recieved", req.body);

  const currentState = await getGroupMembers(releventGroups);
  const groupMembers = currentState[data.roomName];

  switch (type) {
    case "volume-change": {
      const diff = data.newVolume - data.previousVolume;
      const relativeChange = diff > 0 ? `+${diff}` : `${diff}`;

      if (groupMembers && groupMembers.length > 0) {
        await synchronizeGroupVolume(groupMembers, relativeChange);
      }
      break;
    }
    case "mute-change": {
      if (groupMembers && groupMembers.length > 0) {
        synchronizeMute(groupMembers, data.newMute);
      }
      break;
    }
    default:
      break;
  }

  res.status(200).send("OK");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  startTime = new Date().getTime();
  console.log(`Webhook receiver listening on port ${PORT}`);
});
