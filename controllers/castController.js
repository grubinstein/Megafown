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

exports.locationError = (req, res) => {
    req.flash("error", "Error getting location. Did you give permission to share your location? You can enter it manaully if you prefer.");
    res.redirect("back");
}

exports.streamError = (req, res) => {
    req.flash("error", "Error getting audio stream. Did you give permission to share audio?");
    res.redirect("back");
}

exports.dataError = (req, res) => {
    req.flash("error", "Error sending cast data to server.")
    res.redirect("back");
}