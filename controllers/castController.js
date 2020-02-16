const mongoose = require('mongoose');
const Cast = mongoose.model('Cast');
const Peer = mongoose.model('Peer');
import { addCastToDB, addPeerToDB, deleteCast, findCastsWithinRadius } from '../adapters/mongoAdapter';

exports.createCast = async (req, res) => {
    const data = req.body;
    const castID = await addCastToDB(
        data.name,
        data.coordinates
    );
    await addPeerToDB(
        data.peerID,
        "Source",
        castID
    );
    res.status(201).json(castID);
}

exports.endCast = async (req, res) => {
    const deletedCast = await deleteCast(req.body.id);
    if(!deletedCast) { return res.status(404).send() };
    res.status(200).send();
}

exports.nearbyCasts = async (req, res) => {
    const query = req.body;
    const casts = await findCastsWithinRadius(
        query.lat,
        query.lng,
        2000
    );
    res.json(casts);
}