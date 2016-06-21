# EBU NTS 2016
## NMOS Described and Demonstrated
### Demo crib sheet

## Introduction

* What we are trying to achieve as a new company.
  * Ground up implementation of JT-NM, applying big data technologies and IoT concepts to media infrastructure on commodity IT.
  * Everything is browser-based, RESTful, cloud-ready, measured and monitored.
  * Education, design, implementation, support - based around a set of open source tools.
* Tour of Streampunk Media software. http://www.streampunk.media/ and http://www.npmjs.com/~streampunk
  * dynamorse
  * ledger
  * codecadon
  * netadon
  * kelvinadon
* Take an interactive tour
  * Prototype software, things will go wrong, restarts will be required please ask questions as we go ... or even follow along.
  * Install from scratch
  * Set up registration & discovery service
  * Set up Node-RED IoT tool for wiring virtual infrastructure
  * Design and deploy some simple infrastructure with a GUI
  * Meaure what we built
  * Build it again via an API
* Link back to what Peter has already talked about.
  * Everything here can be downloaded and used for free

## Installation

### Platform
* Show installation of Node.js LTS from https://nodejs.org/en/
* Describe node.js and its package manager, culture etc.
* Discuss the need for a compiler at this time

### Regisrtration and discovery - ledger

* Install nmos-ledger - how you install a node module.
  * Show instructions at https://www.npmjs.com/package/nmos-ledger
  * `npm install -g nmos-ledger`
  * `nmos-ledger`
  * Connect to:
   * http://localhost:3002/x-nmos/query/v1.0/ - leave open in a tab
   * http://localhost:3001/x-nmos/registration/v1.0/
  * Show MDNS adveristisement:
   * `dns-sd -B _nmos-query._tcp`
   * `dns-sd -L ledger_query  _nmos-query._tcp`
   * `ping ledger_query.local`
   * `ping ledger_registration.local`

### Designing infrastructure - dynamorse

* Install dynamorse
  * Show instructions at https://www.npmjs.com/package/dynamorse
  * Create and enter a new folder for this demonstration
  * `npm install -g dynamorse`
  * `dynamorse`
* Run GUI http://localhost:8000/red/ and explore funnels, spouts, valves etc..
* Check the NMOS Reg&D NodeAPI at http://localhost:3101/x-nmos/node/v1.0/
  * Browser to node API description of self http://localhost:3101/x-nmos/node/v1.0/self
  * Show that the node has registered itself via query API http://localhost:3002/x-nmos/query/v1.0/nodes
  * Show the devices http://localhost:3101/x-nmos/node/v1.0/devices
  * Show the devices as registered http://localhost:3002/x-nmos/query/v1.0/devices
  * Explore the API by dereferncing a node, e.g. http://localhost:3002/x-nmos/query/v1.0/nodes/<uuid-of-a-node>
* Recap - run NMOS registration service, run NMOS node with 2 devices, node discovers and registers, made a query

### My first flow - grains 101

* Everything that flows in NMOS is a _grain_. Grains have:
  * Payload - the elements of essnece
  * Timestamps - origin and sync + optional SMPTE timecode
  * Flow and Source identifiers
  * Duration
* Let's see one!
  * Save the following files to the same folder where dynamorse is running 
    * Download a grain from https://github.com/AMWA-TV/nmos-in-stream-id-timing/blob/master/examples/pcap/rtp-audio-l24-2chan.pcap?raw=true
    * Download an SDP file that describes the nature of the grain https://raw.githubusercontent.com/AMWA-TV/nmos-in-stream-id-timing/master/examples/sdp/sdp_L24_2chan.sdp
  * Look at the grain in [Wireshark](https://www.wireshark.org/download.html) with [NMOS plugin](https://github.com/AMWA-TV/nmos-in-stream-id-timing/tree/master/software/wireshark_plugins)

* Build a pipeline in dynamorse
![grain101](../images/grain-analyzer.png)
  * Configure pcap reader with:
   * pcap file `rtp-audio-l24-2chan.pcap`
   * description `EBU NTS 2016`
   * device `pipelines...`
   * sdp file `file:sdp_L24_2chan.sdp`
  * Select the debug tab
  * __Deploy__
 * Look at the grain that flowed down the pipe in the debbug tab ... wow!
 * Check out the flows and sources:
   * http://localhost:3101/x-nmos/node/v1.0/flows http://localhost:3002/x-nmos/query/v1.0/flows
   * http://localhost:3101/x-nmos/node/v1.0/sources http://localhost:3002/x-nmos/query/v1.0/sources
 * Other things to try:
  * Set the timeout parameter in spout to 500ms
  * Set the loop parameter in pcap reader and redeploy - notice how the timestampe are constant
  * Set the regenerate paramter in pcap reader and redeploy - timestamps are now incrementing

* Introduce the concept of back pressure

## Playing grains

* Create a WAV file
![make a WAV](../images/wav-file.png)
  * Change the pipeline as shown - type in a file name and __deploy__
  * Look at the file in audacity http://www.audacityteam.org/download/
  * Change the input to `../rtp-audio-l24-2chan-wav.pcap` (avaiable to AMWA incubator members via box) and timeout to 0
  * Add a take node to the pipeline - take 100 grains - creates approx 3sec file

## Sending grains

![send RTP](../images/nmos-flow.png)
* Take a WAV file and send it over NMOS RTP
  * Configure nmos-rtp-out
   * address `225.6.7.8` port `5001` interface _find local IP address_ ttl `127` (default) timeout `40`ms
  * Set input to a 48KHz audio WAV, e.g. https://freesound.org/people/MidEngine4Life/sounds/127966/# 
   * Locally `../steam_48000.wav`
  * Join the multicast group. Run `node`:

```javascript
 var dgram = require('dgram');
 var sock = dgram.createSocket({type: 'udp4', reuseAddr : true});
 sock.bind(5001, console.error);
 sock.addMembership('225.6.7.8', '<local ip>');
 ```
 
  * View packets in Wireshark - set `udp.port eq 5001`

## Encoding a video stream


