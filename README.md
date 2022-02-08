# Megafown
This webapp is designed to help speakers be heard at demonstrations and protests etc, where it is not practical to have a PA powerful enough to be heard by the entire crowd. The idea is that audio is distributed P2P to people spread out through the crowd, who could each use a portable speaker to relay the speaker's words to those around them.

## Casting
Either the organisers or someone at the front of the protest can create a cast using a laptop or mobile device. They simply access the app URL, click cast, and provide a cast name and location (or use their device location).

## Listening
Those who wish to connect to the cast pull up the app URL, click listen, and see a map of casts in their area. They click on the right cast and click connect. They will then automatically be connected to the most upstream peer who is not already streaming to the max number of downstream connections, they will also be registered as an available peer for new peers to receive audio from.

When a peer loses it's upstream connection, it will disconnect from downstream peers and contact the server for a new peer to connect to.

## Potential issues and improvements
It hasn't yet been tested whether connections dropped due to poor signal etc. will be handled correctly. Ideally, the server would track the quality of each peer's connection and ensure the strongest connections were furthest upstream. It could also allow these to stream to a larger number of downstream peers.

It is also interesting to consider the potential interaction of two forms of latency, one caused by the speed of signal transmission through the network and the other caused by the speed of sound. If the stream was passed all the way to the back of the crowd and then back to the front etc. it could make for an odd delay or ping-pong effect experienced by those listening. Perhaps this could be mediated by taking peers' exact locations into account and reshuffling connections to achieve the best effect.

If it was possible to add closed captions to support those who are hard of hearing that would be very desirable.

Some of the appeal of this approach is that it is partially decentralised. Once all peers are connected, an attack on the app's server would not stop the speaker from being heard. Unfortunately, when a peer loses their connection they do need the server to find a new one, and if they have a lot of peers downstream this could knock out a large part of the crowd. It's interesting to think about how the app could become more decentralised. The server code could be modified to run in the browser and all peers could keep a copy of the peer database (could be a blockchain usecase, to protect from malicious edits to the database). New peers could connect by scanning a QR code from an existing peer's device. Perhaps it would even be possible to transmit the app itself peer to peer.

## Setup
Requires two files for environmental variables:
env.json:  
  
{  
    "environment" : "*development/production*",  
    "secret" : "*secret for express-session*"  
    "key" : "*key for express-session*"  
    "database" : "*MongoDB URI*"  
}  
  
variables.env:  
  
MAP_KEY=*google maps API key*  

