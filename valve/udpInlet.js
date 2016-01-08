/* Copyright 2015 Christine S. MacNeill

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

  Unless required by appli cable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/

var dgram = require('dgram');
var H = require('highland');
var SDP = require('../model/SDP');

module.exports = function (client, sdpOrAddress, port, netif) {
  var sdpStream = (SDP.isSDP(sdpOrAddress)) ? H([sdp]) : H([]);
  var address = sdpOrAddress;
  if (SDP.isSDP(sdpOrAddress)) {
    var sdp = sdpOrAddress;
    address = sdp.getConnectionAddress(0);
    port = sdp.getPort(0);
    netif = sdp.getOriginUnicastAddress();
    ttl = sdp.getConnectionTTL(0);
  }
  var errorStream = H('error', client).map(function (e) { throw e; });
  var messageStream = H('message', client, ['msg', 'rinfo']).map(function (o) { return o.msg; });
  var listenStream = H('listening', client).map(function () { return { state: 'listening' }; });
  var closeStream = H('close', client).map(function () { return { state: 'closed' }; })
  if (netif !== undefined && typeof netif === 'string') {
    client.bind(port, function(err) {
      if (err) consle.error('Client bind error', err);
      client.addMembership(address, netif);
      if (typeof ttl === 'number') client.setMulticastTTL(ttl);
    });
  } else {
    client.bind(port);
  }
  return sdpStream.concat(H.merge([errorStream, messageStream, listenStream, closeStream]));
}