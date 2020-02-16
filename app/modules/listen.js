import axios from 'axios';
import { createPeer, connectToPeer, connected } from './peer';
import { newUserFriendlyError } from './errorHandling';

const connectToCast = async (castID) => {
    const [localPeerID, remotePeers] = await Promise.all([createPeer(), getRemotePeers(castID)]);

    const connectedPeer = remotePeers.find(async (p) => {
        return await connectToPeer(p.id);
    });
    
    if(!connectedPeer) { 
        throw newUserFriendlyError("Unable to connect to any of supplied peers. Please try again.");
    }
    reportConnection(localPeerID, connectedPeer.id, castID);
};

const getRemotePeers = async (castID) => { 
    return await axios.get('/api/broker-connection',{
        params: {
            castID 
        }
    }).then(res => res.data);
};

const reportConnection = (localPeer, connectedPeer, castID) => {
    axios.post('/api/report-connection', {
        localPeer,
        connectedPeer,
        castID
    });
}

export { connectToCast }