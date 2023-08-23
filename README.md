# sonos-sync-group-volume

The intended use of this application is to control all grouped Sonos using TV remote control (via Beam etc.).

The application requires two different Node.js servers to be connected to the same network as your Sonos speakers to function (I use a Raspberry Pi but anything that can run Node.js should work).
[An HTTP API bridge for Sonos](https://github.com/jishi/node-sonos-http-api) for sending webhooks whenever something on the Sonos network changes and the server in this repository for receiving those webhooks and act on them.

I got the original idea from https://github.com/arcsoundguy/sonos-group-volume-with-tv-remote but wanted something that would be a little bit easier to configure with less dependecies.

---

## Dependencies

- Node.js
- NPM

---

## Installation

1. Clone this repository (the **HTTP API bridge for Sonos** is added as a git submodule so you will need to initialize that as well):
   `git clone --recurse-submodules https://github.com/ErikAlfredsson/sonos-sync-group-volume.git`
2. Navigtate into the repository: `cd sonos-sync-group-volume`
3. Install dependencies: `npm install`
4. Open the file `index.js` and replace the contents of the variable `relevantGroups` with the names of the rooms that are to be considered as 'master'.
   For instance if you have a room named _TV_ and you want all of its group members to synchronize its volume with _TV_ then the line with relevantGroups should look like this:
   `const releventGroups = ["TV"];`
   If you want to synchronize multiple groups you can do this by adding them as well like so:
   `const releventGroups = ["TV", "TV2"];` etc.
5. Install submodule dependencies: `(cd node-sonos-http-api && npm install --production)`

---

## Usage

_Ideally you would want to daemonize the process with systemd for instance but I won't cover that in this readme._

Start the server with `npm start`.
