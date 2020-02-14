import axios from 'axios';

const connectToCast = (castID) => {
    axios.get('/api/broker-connection',{
        params: {
            castID 
        }
    })
}

export { connectToCast };