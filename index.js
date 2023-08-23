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

const app = express();

app.use(bodyParser.json());

app.post("/sonos", async (req, res) => {
  console.log("webhook recieved", req.body);
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

  const currentState = await getGroupMembers(releventGroups);
  const groupMembers = currentState[data.roomName];

  switch (type) {
    case "volume-change": {
      const diff = data.newVolume - data.previousVolume;
      const relativeChange = diff > 0 ? `+${diff}` : `${diff}`;

      if (groupMembers && groupMembers.length > 0) {
        await synchronizeGroupVolume(groupMembers, relativeChange);
      }
    }
    case "mute-change": {
      if (groupMembers && groupMembers.length > 0) {
        synchronizeMute(groupMembers, data.newMute);
      }
    }
    default:
      break;
  }

  res.status(200).send("OK");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Webhook receiver listening on port ${PORT}`);
});
