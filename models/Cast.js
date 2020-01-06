const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const castSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true
    },
    created: {
        type: Date,
        default: Date.now
    },
    location: {
        type: {
            type: String,
            default: 'Point'
        },
        coordinatess: [{
            type: Number,
            required: 'You must supply coordinates'
        }]
    },
    peerid: {
        type: String,
        required: 'You must supply a peerid'
    }
})

module.exports = mongoose.model('Cast', castSchema);