'use strict'

// Use webpack normally
require('./main.scss')
import axios from 'axios';


const peer = new Peer();

peer.on('open', function(id) {
	window.peerid = id;
});

document.getElementById("call-btn").addEventListener("click", makeCall);

document.getElementById("cast-btn").addEventListener("click", prepareForCast);

const prepareForCast = async () => {
	const [stream, position] = await Promise.all(getAudioStreamPromise, getLocationPromise);
	window.localStream = stream;
	await axios.post('/api/new-cast', {
		position: position,
		location: location,
		peerid: window.peerid
	});
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
		navigator.geolocation.getCurrentPosition( position => {
			resolve(position);
		},(err) => {
			reject(err);
		});
	});
};




const makeCall = () => {  
	const remoteId = document.getElementById("remoteID").value;
	
	var conn = peer.connect(remoteId);
}

peer.on('connection', (conn) => {
	conn.on('open', () => {
		console.log("New connection from " + conn.peer);
		var call = peer.call(conn.peer, window.localStream)
	})
});

peer.on('call', (call) => {
	console.log("Received call");
	call.answer();
	call.on("stream", (remoteStream) => {
		const player = document.getElementById("audio-player");
		player.srcObject = remoteStream;
		player.play();
	})
})
