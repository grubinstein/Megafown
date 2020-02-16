import axios from 'axios';
import { createPeer, connectToPeer, connected } from './peer';
import { newUserFriendlyError } from './errorHandling';

const connectToCast = async (castID) => {
    const [localPeerID, remotePeers] = await Promise.all([createPeer(), getRemotePeers(castID)]);
    const connectedPeer = remotePeers.find(async ({ candidatePeerID }) => {
        return await connectToPeer(candidatePeerID);
    });
    
    if(!connectedPeer) {throw newUserFriendlyError("Unable to connect to any of supplied peers. Please try again.")}
    
    reportConnection(
        localPeerID, 
        connectedPeer, 
        castID, 
    );
};

const getRemotePeers = async (castID) => { 
    return await axios.get('/api/broker-connection',{
        params: {
            castID 
        }
    }).then(res => res.data);
};

const reportConnection = (localPeerID, remotePeer, castID) => {
    const remotePeerID = remotePeer.id;
    const tier = remotePeer.tier + 1;
    axios.post('/api/report-connection', {
        localPeerID,
        remotePeerID,
        castID,
        tier
    });
}

export { connectToCast }