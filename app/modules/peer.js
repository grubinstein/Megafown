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

const connectToPeer = (remoteID) => new Promise((resolve, reject) => {
	const connection = peer.connect(remoteID);

	peer.on('call', (call) => {
		call.answer();
		call.on("stream", (remoteStream) => {
			resolve(true);
			stream = remoteStream;
			const player = document.getElementById("audio-player");
			player.srcObject = remoteStream;
			player.play();
		})
	})

	setTimeout(() => {
		resolve(false);
		connection.close();
	},2000);
});

export { createPeer, getPeerId, destroyPeer, getAudioStream, connectToPeer};