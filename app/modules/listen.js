import axios from 'axios';
import { createPeer, connectToUpstreamPeer, disconnectFromPeers, getPeerID, sendCastEndSignal } from './peer';
import { newUserFriendlyError, catchErrors, promiseTimeout } from './errorHandling';
import { setLocation } from './location';
import { $ } from './bling';
let upstreamPeer, connectedCastID;
let connected = false;

const connectToCast = async castID => {
    changeDisplayState("connecting");
    const [localPeerID, upstreamPeersList] = await Promise.all([createPeer(), getRemotePeers(castID)]);
    upstreamPeer = await connectToFirstAvailablePeer(upstreamPeersList);

    if(!upstreamPeer) {
        changeDisplayState("map");
        throw newUserFriendlyError("Unable to connect to any of supplied peers. Please try again.");
    }
    
    changeDisplayState("playing");
    connected = true;
    upstreamPeer.connection.listenForCastEnd(handleCastEnd);
    upstreamPeer.connection.listenForClose(handleUpstreamDisconnect);

    connectedCastID = castID;
    reportConnection(localPeerID, castID);

    window.addEventListener('unload', disconnectFromCast);
};

const connectToFirstAvailablePeer = async (peers) => {
    for(let i = 0; i < peers.length; i++) {
        const upstreamConnection = await promiseTimeout(2000,connectToUpstreamPeer(peers[i].id));
        if (upstreamConnection) {
            peers[i].connection = upstreamConnection;
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

const changeDisplayState = (newState) => {
    const states = ["map","playing", "connecting", "searching", "end"];
    states.forEach(state => {
        if(state == newState) {
            $(".cast-" + state).classList.remove("d-none");
        } else {
            $(".cast-" + state).classList.add("d-none");
        }
    })
}

const disconnectFromCast = async () => {
    connected = false;
    disconnectFromPeers();
    await reportDisconnection();
    changeDisplayState("map");
    upstreamPeer = null;
    connectedCastID = null;
}

$("#stopPlayingBtn") && $("#stopPlayingBtn").on("click", catchErrors(disconnectFromCast, {msg: "Stream failed to close properly."}));
$("#newSearch") && $("#newSearch").on("click", () => {
    changeDisplayState("map");
    setLocation(null);
});

const reportDisconnection = async () => {
    const localPeerID = getPeerID();
    axios.post('/api/report-disconnection', {
        localPeerID,
        upstreamPeerID: upstreamPeer.id
    })
}

const handleCastEnd = async () => {
    if(!connected) {return;}
    connected = false;
    await sendCastEndSignal();
    changeDisplayState("end");
    await reportDisconnection();
}

const handleUpstreamDisconnect = async () => {
    disconnectFromPeers();
    if(!connected) {return;}
    connected = false;
    const castID = connectedCastID;
	await reportDisconnection();
	await catchErrors(connectToCast(castID));
}

export { connectToCast, changeDisplayState }