import axios from 'axios';
import { createPeer, connectToUpstreamPeer, disconnectFromPeers, getPeerID } from './peer';
import { newUserFriendlyError, catchErrors } from './errorHandling';
import { $ } from './bling';
let upstreamPeer, connectedCastID;

const connectToCast = async castID => {
    const [localPeerID, upstreamPeersList] = await Promise.all([createPeer(), getRemotePeers(castID)]);
    upstreamPeer = await connectToFirstAvailablePeer(upstreamPeersList);

    if(!upstreamPeer) {throw newUserFriendlyError("Unable to connect to any of supplied peers. Please try again.");}
    
    togglePlaying();
    connectedCastID = castID;
    reportConnection(localPeerID, castID);

    window.addEventListener('unload', disconnectFromCast);
};

const connectToFirstAvailablePeer = async (peers) => {
    for(let i = 0; i < peers.length; i++) {
        const upstreamCall = await connectToUpstreamPeer(peers[i].id)
        if (upstreamCall) {
            peers[i].call = upstreamCall;
            return peers[i];
        }
    }
    return false;
}

const getRemotePeers = async (castID) => { 
    return await axios.get('/api/broker-connection',{
        params: {
            castID 
        }
    }).then(res => res.data);
};

const reportConnection = (localPeerID, castID) => {
    const upstreamPeerID = upstreamPeer.id;
    const tier = upstreamPeer.tier + 1;
    axios.post('/api/report-connection', {
        localPeerID,
        upstreamPeerID,
        castID,
        tier
    });
}

const togglePlaying = () => {
    $(".cast-search").classList.toggle("d-none");
    $(".cast-playing").classList.toggle("d-none");
}

const disconnectFromCast = async () => {
    disconnectFromPeers();
    await reportDisconnection();
}

$("#stopPlayingBtn") && $("#stopPlayingBtn").on("click", catchErrors(disconnectFromCast, {msg: "Stream failed to close properly."}));

const reportDisconnection = async () => {
    const localPeerID = getPeerID();
    axios.post('/api/report-disconnection', {
        localPeerID,
        upstreamPeerID: upstreamPeer.id
    }).then(() => {
        togglePlaying();
        upstreamPeer = null;
        connectedCastID = null;
    })
}

export { connectToCast }