const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const peerSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: "You must supply a peer ID"
    },
    connected: {
        type: Date,
        default: Date.now
    },
    tier: {
        type: Number,
        min: 0,
        default: 0
    },
    upstreamPeer: {
        type: 'String'
    },
    cast: {
        type: mongoose.Schema.ObjectId,
        ref: 'Cast',
        required: 'You must supply a cast'
    },
    downstreamPeers: {
        type: Number,
        min: 0,
        max: 2,
        default: 0
    }
}, { _id: false });

peerSchema.index({ cast: 1, tier: 1 }, { partialFilterExpression: { downstreamPeers: { $lt: 2 }}});

module.exports = mongoose.model('Peer', peerSchema);