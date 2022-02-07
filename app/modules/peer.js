'use strict'

let peer, stream, upstreamConnection, upstreamCall;
let downstreamPeerConnections = [];
let maxDownstreamPeers = 2;

const createPeer = () => new Promise((resolve, reject) => {
	peer = new Peer();
	peer.on('connection', (conn) => {
		if(downstreamPeerConnections.length == maxDownstreamPeers) {
			conn.send("at capacity");
		} else {
			conn.on('open', () => {
				console.log("New connection from " + conn.peer);
				peer.call(conn.peer, stream);
				downstreamPeerConnections.push(conn);
			})

			conn.on('close', () => {
				const index = downstreamPeerConnections.indexOf(conn);
				if(index > -1) {
					downstreamPeerConnections.splice(index,1);
				}
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

const connectToUpstreamPeer = remoteID => new Promise((resolve, reject) => {
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

	upstreamConnection.on('close', handleUpstreamDisconnect);
	
	setTimeout(() => {
		resolve(false);
		upstreamConnection.close();
	},2000);
});

const disconnectFromPeers = () => {
	upstreamConnection.close();
	upstreamCall.close();
	downstreamPeerConnections.forEach(c => c.close());
	downstreamPeerConnections.splice(0, downstreamPeerConnections.length)
}

const handleUpstreamDisconnect = () => {
	console.log("Upstream peer disconnected");
	
}

export { createPeer, getPeerID, destroyPeer, getAudioStream, connectToUpstreamPeer, disconnectFromPeers};