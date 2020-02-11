const mongoose = require('mongoose');
const Cast = mongoose.model('Cast');

exports.createCast = async (req, res) => {
    const cast = await (new Cast(req.body)).save();
    res.status(201).json(cast);
}

exports.endCast = async (req, res) => {
    const deletedCast = await Cast.findByIdAndDelete(req.body.id)
    if(!deletedCast) { return res.status(404).send() };
    res.status(200).send();
}

exports.nearbyCasts = async (req, res) => {
    const coordinates = [req.body.lng, req.body.lat].map(parseFloat);
    const query = {
        location: {
            $near: {
                $geometry: {
                    type: 'Point',
                    coordinates
                },
                $maxDistance: 2000
            }
        }
    };
    const casts = await Cast.find(query).select('name location peerId created');
    res.json(casts);
}