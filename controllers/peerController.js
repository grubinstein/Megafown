const mongoose = require('mongoose');
const Peer = mongoose.model('Peer');

exports.brokerConnection = async (req, res) => {
    const castID = req.query.castID;
    const peer = await Peer.findOneAndUpdate({
        downstreamPeers: { $lt: 2 },
        cast: castID
    }, { 
        $inc: { downstreamPeers: 1 }
    }, {
        new: true,
        sort: { tier: 1 }
    })
    res.status(200).json(peer);
}