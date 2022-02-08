# Megafown
This webapp is designed to help speakers be heard at demonstrations and protests etc, where it is not practical to have a PA powerful enough to be heard by the entire crowd. The idea is that audio is distributed P2P to people spread out through the crowd, who each use a portable speaker to relay the speaker's words to those around them.

## Casting
Either the organisers or someone at the front of the protest can create a cast using a laptop or mobile device. They simply access the app URL, click cast, and provide a cast name and location (or use their device location).

## Listening
Those who wish to connect to the cast pull up the app URL, click listen, and see a map of casts in their area. They click on the right cast and click connect. They will then automatically be connected to the most upstream peer who is not already streaming to the max number of downstream connections, they will also be registered as an available peer for new peers to receive audio from.

## Setup
Requires two files for environmental variables:
env.json:
{
    "environment" : "*development/production*",
    "secret" : "*secret for express-session*"
    "key" : "*key for express-session*"
    "database" : "*MongoDB URI*"
}

variables.env
MAP_KEY=*google maps API key*

