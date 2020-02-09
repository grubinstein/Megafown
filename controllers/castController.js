const mongoose = require('mongoose');
const Cast = mongoose.model('Cast');

exports.createCast = async (req, res) => {
    console.log(req.body);
    const cast = await (new Cast(req.body)).save();
    res.status(201).json(cast);
}

exports.endCast = async (req, res) => {
    const deletedCast = await Cast.findByIdAndDelete(req.body.id)
    if(!deletedCast) { return res.status(404).send() };
    res.status(200).send();
}
