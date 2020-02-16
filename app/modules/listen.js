import axios from 'axios';
import { createPeer, connectToPeer, disconnectFromPeer, getPeerID } from './peer';
import { newUserFriendlyError, catchErrors } from './errorHandling';
import { $ } from './bling';
let remotePeerID;

const connectToCast = async castID => {
    const [localPeerID, remotePeers] = await Promise.all([createPeer(), getRemotePeers(castID)]);
    let i = 0;
    let connected = false;

    while(!connected && i < remotePeers.length) {
        connected = await connectToPeer(remotePeers[i].id);
        if(!connected) {i++}
    }
    if(!connected) {throw newUserFriendlyError("Unable to connect to any of supplied peers. Please try again.");}
    
    const connectedPeer = remotePeers[i];
    togglePlaying();
    remotePeerID = connectedPeer.id;
    reportConnection(localPeerID, connectedPeer, castID);
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

const togglePlaying = () => {
    $(".cast-search").classList.toggle("d-none");
    $(".cast-playing").classList.toggle("d-none");
}

const disconnectFromCast = async () => {
    disconnectFromPeer();
    await reportDisconnection();
}

$("#stopPlayingBtn") && $("#stopPlayingBtn").on("click", catchErrors(disconnectFromCast, {msg: "Stream failed to close properly."}));

const reportDisconnection = async () => {
    const localPeerID = getPeerID();
    axios.post('/api/report-disconnection', {
        localPeerID,
        remotePeerID
    }).then(() => {
        togglePlaying();
        connectedCastID = null;
        connecterPeerID = null;
    })
}

export { connectToCast }