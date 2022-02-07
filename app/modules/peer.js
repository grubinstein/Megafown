'use strict'

let peer, stream, upstreamConnection, upstreamCall;
let downstreamPeerCalls = [];
let maxDownstreamPeers = 2;

const createPeer = () => new Promise((resolve, reject) => {
	peer = new Peer();
	peer.on('connection', (conn) => {
		if(downstreamPeerCalls.length == maxDownstreamPeers) {
			conn.send("at capacity");
		} else {
			conn.on('open', () => {
				console.log("New connection from " + conn.peer);
				const call = peer.call(conn.peer, stream);
				downstreamPeerCalls.push(call);

				call.on('close', () => {
					const index = downstreamPeerCalls.indexOf(call);
					if(index > -1) {
						downstreamPeerCalls.splice(index,1);
					}
				})
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
			stream = remoteStream;
			const player = document.getElementById("audio-player");
			player.srcObject = remoteStream;
			player.play();
			upstreamCall.on('close', handleUpstreamDisconnect);
			resolve(upstreamCall);
		})
	})

	peer.on('data', (message) => {
		if(message == "at capacity") {
			upstreamConnection.close();
			resolve(false);
		}
	})

});

const disconnectFromPeers = () => {
	upstreamConnection.close();
	upstreamCall.close();
	disconnectFromDownStreamPeers();
}

const disconnectFromDownStreamPeers = () => {
	downstreamPeerCalls.forEach(c => c.close());
	downstreamPeerCalls.splice(0, downstreamPeerCalls.length);
}

const handleUpstreamDisconnect = () => {
	console.log("Upstream peer disconnected");
	disconnectFromDownStreamPeers();
	console.log("Disconnected downstream peers");
}

export { createPeer, getPeerID, destroyPeer, getAudioStream, connectToUpstreamPeer, disconnectFromPeers};