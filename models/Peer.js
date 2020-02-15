const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const peerSchema = new mongoose.Schema({
    connected: {
        type: Date,
        default: Date.now
    },
    tier: {
        type: Number,
        min: 0,
        default: 0
    }
    peerId: {
        type: String,
        required: "You must supply a peer ID"
    },
    remotePeerId: {
        type: String,
        required: "You must supply a remote peer ID"
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
});

peerSchema.index({ connected: 1 });
peerSchema.index({ downstreamPeers: 1 });

module.exports = mongoose.model('Peer', peerSchema);