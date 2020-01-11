require('regenerator-runtime/runtime');
const axios = require('axios');

const prepareForCast = async () => {
	const castName = getCastName();
	const [stream, position] = await Promise.all([getAudioStreamPromise(), getLocationPromise()]);
	window.localStream = stream;
	const cast = {
		location: {
			coordinates: [
				position.coords.longitude,
				position.coords.latitude
			]
		},
		peerid: window.peerid
	}
	if(castName) { cast.name = castName };
	await axios.post('/api/new-cast', cast);
}

const getCastName = () => {
	return document.getElementById("castName").value;
}

const getAudioStreamPromise = () => {
	return new Promise((resolve, reject) => {
		const getUserMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || (navigator.mediaDevices && navigator.mediaDevices.getUserMedia)).bind(navigator);
		getUserMedia({video: false, audio:true}, (stream) => {
			resolve(stream);
		}, (err) => {
			reject(err);
		});
	});
};

const getLocationPromise = () => {
	return new Promise((resolve, reject) => {
		navigator.geolocation.getCurrentPosition( (position) => {
			resolve(position);
		},(err) => {
			reject(err);
		});
	});
};

module.exports = prepareForCast;