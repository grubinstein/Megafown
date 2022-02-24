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
			upstreamConnection = null;
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
		const upstreamConnectionWrapper = new connectionWrapper(upstreamConnection);
		resolve(upstreamConnectionWrapper);
	})
}

class connectionWrapper {
	closeListeners = [];
	castEndListeners = [];
	
	constructor(conn) {
		conn.on('close', this.callCloseListeners);
		conn.on('data', message => {
			if (message == "cast ended") {
				this.callCastEndListeners();
			}
		});
	}

	listenForClose(fn) {
		this.closeListeners.push(fn);
	}

	listenForCastEnd(fn) {
		this.castEndListeners.push(fn);
	}

	callCloseListeners = () => {
		if (!this.closeListeners.length) {return;}
		this.closeListeners.forEach(fn => fn());
	}

	callCastEndListeners = () => {
		if (!this.castEndListeners.length) {return;}
		this.castEndListeners.forEach(fn => fn());
	}
}

const handleDownstreamConnection = conn => {
	if(downstreamPeerConnections.length == maxDownstreamPeers) {
		conn.send("at capacity");
	} else {
		conn.on('open', () => {
			conn.send("hello");
			const call = peer.call(conn.peer, stream);
			downstreamPeerConnections.push(conn);
			conn.on('close', handleDownstreamDisconnect(conn))
		})
	}
} 

const sendCastEndSignal = () => {
	downstreamPeerConnections.forEach(conn => conn.send("cast ended"));
}

const handleDownstreamDisconnect = conn => () => {
	const index = downstreamPeerConnections.indexOf(conn);
	if(index > -1) {
		downstreamPeerConnections.splice(index,1);
	}
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

export { createPeer, getPeerID, destroyPeer, getAudioStream, connectToUpstreamPeer, disconnectFromPeers, sendCastEndSignal};
