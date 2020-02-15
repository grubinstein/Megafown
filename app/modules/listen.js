import axios from 'axios';
import { createPeer } from './peer';

const connectToCast = async (castID) => {
    const localPeer = await createPeer();
    const remotePeerID = await getRemotePeerID(castID);
    console.log(remotePeerID);
};

const getRemotePeerID = async (castID) => { 
    return await axios.get('/api/broker-connection',{
        params: {
            castID 
        }
    }).then(res => res.data.peerId);
};

export { connectToCast }