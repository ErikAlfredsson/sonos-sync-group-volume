# sonos-sync-group-volume

This application solves a very specific use case that Sonos doesn't support out-of-the-box, i.e control all grouped Sonos using a TV remote control (via Beam etc.).
In my case I have a Beam connected via ARC to the TV. I also have an Amp that is grouped with the Beam so that the Amp plays whatever the TV (Beam) is playing. This works but the TV remote only controls the volume of the Beam, not the members of the group. This application solves that issue by listening for volume changes broadcasted by the 'master' speaker (in my case the Beam) and synchronizing the group members volume accordingly so that the group volume is in sync.

I've implemeted it so that you specify a 'master' speaker and whenever its volume change the application checks if the speaker has any group members. If it does the application updates the volume for all other speakers in the group. This means that you can kind of enable/disable this application by ungrouping the speakers/rooms.
I've also implemented the option to use relative volume change so that you can adjust the volume relationship between the speakers in the Sonos app. If you decrease the 'master' speakers volume by 2 with the TV remote, all other speakers in the group will decrease its volume by 2, keeping the volume relationship in sync. However there seems to be some cases where they can end up out of sync anyways, will try to improve that at some point.

If you want to try relative volume, change the line:
`const useRelativeVolume = false;` to `const useRelativeVolume = true;` in index.js.
If you want to use absolute volume so that the volume of the 'master' is exaclty mirrored to the group members no change is needed.

The application requires two different Node.js servers to be connected to the same network as your Sonos speakers to function (I use a Raspberry Pi but anything that can run Node.js should work).
[An HTTP API bridge for Sonos](https://github.com/jishi/node-sonos-http-api) for sending webhooks whenever something on the Sonos network changes and the server in this repository for receiving those webhooks and act on them.

I got the original idea from https://github.com/arcsoundguy/sonos-group-volume-with-tv-remote but wanted something that was a bit more flexible and would be a little bit easier to configure with less dependecies.

**If you have a question or are having trouble getting started just post an issue!**

## Dependencies

- Node.js
- NPM

## Installation

1. Clone this repository (the **HTTP API bridge for Sonos** is added as a git submodule so you will need to initialize that as well):
   `git clone --recurse-submodules https://github.com/ErikAlfredsson/sonos-sync-group-volume.git`
2. Navigtate into the repository: `cd sonos-sync-group-volume`
3. Install dependencies: `npm install`
4. Install submodule dependencies: `(cd node-sonos-http-api && npm install --production)`
5. Open the file `index.js` and replace the contents of the variable `relevantGroups` with the names of the rooms that are to be considered as 'master'.
   For instance if you have a room named _TV_ and you want all of its group members to synchronize its volume with _TV_ then the line with relevantGroups should look like this:
   `const releventGroups = ["TV"];`
   If you want to synchronize multiple groups (independently) you can do this by adding them as well like so:
   `const releventGroups = ["TV", "TV2"];` etc.

## Usage

_Ideally you would want to daemonize the process with systemd for instance but I won't cover that in this readme._

Start the server with `npm start`.

Edit:
I've added two scripts:
`sonos-sync-group-volume.sh` and `sonos-sync-group-volume.service`.

These can be seen as a starting point to how to daemonize the application. Might update the readme when I have some more time to spare.
