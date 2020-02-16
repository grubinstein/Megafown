import { getViablePeersForCast } from '../adapters/mongoAdapter';

const brokerConnection = async (req, res) => {
    const castID = req.query.castID;
    const peers = await getViablePeersForCast(castID, 2, 4);
    res.status(200).json(peers);
}

export { brokerConnection }