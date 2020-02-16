import axios from 'axios';
import { createPeer, connectToPeer, connected } from './peer';

const connectToCast = async (castID) => {
    const remotePeers = await getRemotePeers(castID);
    await createPeer();
    let i = 0;
    console.log(remotePeers);
    while(!connected && i < remotePeers.length) {
        console.log(i);
        await connectToPeer(remotePeers[i].peerID).catch(function() { i++ });
    }
};

const getRemotePeers = async (castID) => { 
    return await axios.get('/api/broker-connection',{
        params: {
            castID 
        }
    }).then(res => res.data);
};

export { connectToCast }