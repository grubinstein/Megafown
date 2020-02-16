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
        coordinates: [{
            type: Number,
            required: 'You must supply coordinates'
        }]
    }
});

castSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Cast', castSchema);