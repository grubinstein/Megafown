const mongoose = require('mongoose');
const Cast = mongoose.model('Cast');

exports.newCast = async (req, res) => {
    const cast = await (new Cast(req.body)).save();
    res.status(201).send();
}