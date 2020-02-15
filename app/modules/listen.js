import axios from 'axios';
import { createPeer, connectToPeer } from './peer';

const connectToCast = async (castID) => {
    await createPeer();
    const remotePeerID = await getRemotePeerID(castID);
    connectToPeer(remotePeerID);
};

const getRemotePeerID = async (castID) => { 
    return await axios.get('/api/broker-connection',{
        params: {
            castID 
        }
    }).then(res => res.data.peerId);
};

export { connectToCast }