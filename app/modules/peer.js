'use strict'

let peer;
let stream;

const createPeer = () => new Promise((resolve, reject) => {
	peer = new Peer();
	peer.on('open', resolve);

	peer.on('connection', (conn) => {
		conn.on('open', () => {
			console.log("New connection from " + conn.peer);
			var call = peer.call(conn.peer, stream);
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
});

const getPeerId = () => peer.id;

const destroyPeer = () => {
    peer.destroy();
}

const getAudioStream = () => new Promise((resolve, reject) => {
	const getUserMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || (navigator.mediaDevices && navigator.mediaDevices.getUserMedia)).bind(navigator);
	getUserMedia({video: false, audio:true}, (s) => {
        stream = s;
		resolve();
	}, (err) => {
		reject(err);
	});
});

const connectToPeer = (remoteID) => {  
	peer.connect(remoteID);
}

export { createPeer, getPeerId, destroyPeer, getAudioStream, connectToPeer };