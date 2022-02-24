const mongoose = require('mongoose');
const Cast = mongoose.model('Cast');
const Peer = mongoose.model('Peer');
import { addCastToDB, addPeerToDB, deleteCastFromDB, deletePeersFromDBByCastID, findCastsWithinRadius } from '../adapters/mongoAdapter';

exports.createCast = async (req, res) => {
    const { name, coordinates, localPeerID } = req.body;
    const castID = await addCastToDB(name, coordinates);
    
    await addPeerToDB({castID, localPeerID});
    res.status(201).json(castID);
}

exports.endCast = async (req, res) => {
    const { castID, peerID } = req.body;
    const [ deletedCast, deletedPeer ] = await Promise.all(
        [
            deleteCastFromDB(castID),
            deletePeersFromDBByCastID(castID)
        ]
    );
    if(!deletedCast && !deletedPeer) { return res.status(404).send() };
    res.status(200).send();
}

exports.nearbyCasts = async (req, res) => {
    const { lat, lng } = req.body;
    const casts = await findCastsWithinRadius(lat, lng, 2000);
    res.json(casts);
}