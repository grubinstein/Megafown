import { getViablePeersForCast, addPeerToDB, incrementDownstreamPeers } from '../adapters/mongoAdapter';

const brokerConnection = async (req, res) => {
    const castID = req.query.castID;
    const peers = await getViablePeersForCast(castID, 2, 4);
    res.status(200).json(peers);
}

const reportConnection = async (req, res) => {
    const { localPeer, connectedPeer, castID } = req.body;
    await Promise.all(
        [
            incrementDownstreamPeers(connectedPeer),
            addPeerToDB(
                castID,
                localPeer,
                connectedPeer
            )
        ]
    );
    res.status(200).send();
}

export { brokerConnection, reportConnection }