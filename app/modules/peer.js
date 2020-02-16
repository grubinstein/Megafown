'use strict'

let peer, stream, upstreamConnection, upstreamCall;

const createPeer = () => new Promise((resolve, reject) => {
	peer = new Peer();
	peer.on('connection', (conn) => {
		conn.on('open', () => {
			console.log("New connection from " + conn.peer);
			var call = peer.call(conn.peer, stream);
		})
	});
	peer.on('open', resolve);
});

const getPeerID = () => peer.id;

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

const connectToPeer = remoteID => new Promise((resolve, reject) => {
	upstreamConnection = peer.connect(remoteID);

	peer.on('call', (call) => {
		call.answer();
		upstreamCall = call;
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
		upstreamConnection.close();
	},2000);
});

const disconnectFromPeer = () => {
	upstreamConnection;
	upstreamConnection.close();
	upstreamCall.close();
}

export { createPeer, getPeerID, destroyPeer, getAudioStream, connectToPeer, disconnectFromPeer};