import { getViablePeersForCast, addPeerToDB, deletePeerFromDB, incrementDownstreamPeers, decrementDownstreamPeers } from '../adapters/mongoAdapter';

const brokerConnection = async (req, res) => {
    const castID = req.query.castID;
    const peers = await getViablePeersForCast(castID, 2, 4);
    res.status(200).json(peers);
}

const reportConnection = async (req, res) => {
    const { remotePeerID } = req.body;
    await Promise.all(
        [
            incrementDownstreamPeers(remotePeerID),
            addPeerToDB(req.body)
        ]
    );
    res.status(200).send();
}

const reportDisconnection = async (req, res) => {
    const { localPeerID, remotePeerID } = req.body;
    await Promise.all(
        [
            decrementDownstreamPeers(remotePeerID),
            deletePeerFromDB(localPeerID)
        ]
    );
    res.status(200).send();
}

export { brokerConnection, reportConnection, reportDisconnection }