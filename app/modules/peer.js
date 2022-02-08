'use strict'

let peer, stream, upstreamConnection, upstreamCall;
let downstreamPeerConnections = [];
let maxDownstreamPeers = 2;

const createPeer = () => new Promise((resolve, reject) => {
	peer = new Peer();
	peer.on('connection', handleDownstreamConnection);
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

	peer.on('data', message => {
		if(message == "at capacity") {
			upstreamConnection.close();
			resolve(false);
		}
	})
	
	peer.on('call', handleUpstreamCall(resolve));
});

const handleUpstreamCall = resolve => call => {
	call.answer();
	upstreamCall = call;
	call.on("stream", (remoteStream) => {
		stream = remoteStream;
		const player = document.getElementById("audio-player");
		player.srcObject = remoteStream;
		player.play();
		resolve(upstreamConnection);
	})
}

const handleDownstreamConnection = conn => {
	console.log("New downstream connection");
	if(downstreamPeerConnections.length == maxDownstreamPeers) {
		console.log("Rejecting due to capacity");
		conn.send("at capacity");
	} else {
		conn.on('open', () => {
			console.log("New connection from " + conn.peer);
			const call = peer.call(conn.peer, stream);
			downstreamPeerConnections.push(conn);
			conn.on('close', handleDownstreamDisconnect(conn))
		})
	}
}

const handleDownstreamDisconnect = conn => () => {
	const index = downstreamPeerConnections.indexOf(conn);
	if(index > -1) {
		downstreamPeerConnections.splice(index,1);
	}
	console.log(downstreamPeerConnections);
}

const disconnectFromPeers = () => {
	upstreamConnection.close();
	upstreamCall.close();
	upstreamConnection = null;
	upstreamCall = null;
	disconnectFromDownStreamPeers();
}

const disconnectFromDownStreamPeers = () => {
	downstreamPeerConnections.forEach(c => c.close());
	downstreamPeerConnections.splice(0, downstreamPeerConnections.length);
}

export { createPeer, getPeerID, destroyPeer, getAudioStream, connectToUpstreamPeer, disconnectFromPeers};
