'use strict'

let peer, stream, upstreamConnection, upstreamCall;
let downstreamPeers = 0;
let maxDownstreamPeers = 2;

const createPeer = () => new Promise((resolve, reject) => {
	peer = new Peer();
	peer.on('connection', (conn) => {
		if(downstreamPeers == maxDownstreamPeers) {
			conn.send("at capacity");
		} else {
			conn.on('open', () => {
				console.log("New connection from " + conn.peer);
				peer.call(conn.peer, stream);
				downstreamPeers++;
			})
		}
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

	peer.on('data', (message) => {
		if(message == "at capacity") {
			resolve(false);
			upstreamConnection.close();
		}
	})
	
	setTimeout(() => {
		resolve(false);
		upstreamConnection.close();
	},2000);
});

const disconnectFromPeer = () => {
	upstreamConnection.close();
	upstreamCall.close();
}

export { createPeer, getPeerID, destroyPeer, getAudioStream, connectToPeer, disconnectFromPeer};