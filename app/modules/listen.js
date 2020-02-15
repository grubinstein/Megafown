import axios from 'axios';

const connectToCast = async (castID) => {
    const peer = await axios.get('/api/broker-connection',{
        params: {
            castID 
        }
    });
    console.log(peer);
}

export { connectToCast };