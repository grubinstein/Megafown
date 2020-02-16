import { model } from 'mongoose';
const Cast = model('Cast');
const Peer = model('Peer');

/**
 * Gets a list of peers connected to the specified cast with
 * fewer than the specified number of downstream connections.
 * 
 * @param {string} castID - The id of the cast to match.
 * @param {number} maxDownstreamConnections.
 * @param {number} numPeers - The number of peers to return.
 * @returns {Promise} Array of peers as JSON objects with peerID and tier
 */
export const getViablePeersForCast =  async (castID, maxDownstreamConnections, numPeers) => {
    const peers = await Peer.find(
        {
            downstreamPeers: { $lt: maxDownstreamConnections },
            cast: castID
        }, 
        null, 
        {
            sort: { 
                tier: 1,
                created: 1
            },
            limit: numPeers
        }
    ).select('peerID tier');
    return peers;
}

/**
 * Create a cast record in database
 * @param {string} name - Name of cast
 * @param {array} coords - Location of cast as an array of coordinates ([lat, lng])
 * @returns {Promise} - Cast ID as string
 */
export const addCastToDB = async (name, coords) => {
    const cast = await (new Cast({
        name,
		location: {
			coordinates: [
				coords[1],
				coords[0]
			]
		}
    })).save();
    return cast._id;
}

/**
 * Create a peer record in database
 * @param {string} peerID - Peer.js id for local peer
 * @param {string} remotePeerID - Peer.js id for remote peer or "Source" if caster
 * @param {string} cast - ID of the cast this peer is listening to
 * @returns {Promise} - Stored peer as JSON object with connected (date), tier (number), peerID & remotePeerID (string), cast (id as string), downstreamPeers (number)
 */
export const addPeerToDB = (peerID, remotePeerID, cast) => {
    return (new Peer({
        peerID,
        remotePeerID,
        cast
    })).save();
}

/**
 * Delete cast
 * @param {string} castID - ID of cast to be deleted
 * @returns {Promise} - Deleted cast
 */
export const deleteCast = (castID) => {
    return Cast.findByIdAndDelete(castID);
}

/**
 * Find casts within given distance of lat lng
 * @param {number} lat - Latitude of position to search
 * @param {number} lng - Longitude of position to search
 * @param {number} radius - Search radius in metres
 * @returns {Prommise} - Array of casts as JSON objects with id, name, lat, lng, created 
 */
export const findCastsWithinRadius = async (lat, lng, radius) => {
    const coordinates = [lng, lat].map(parseFloat);
    const query = {
        location: {
            $near: {
                $geometry: {
                    type: 'Point',
                    coordinates
                },
                $maxDistance: radius
            }
        }
    };
    const casts = await Cast.find(query).select('name location created');
    return casts.map(c => {
        return {
            id: c._id,
            name: c.name,
            lat: c.location.coordinates[1],
            lng: c.location.coordinates[0],
            created: c.created
        }
    });
}