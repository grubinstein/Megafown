'use strict'

// Use webpack normally
require('./main.scss')


const peer = new Peer();

peer.on('open', function(id) {
	document.getElementById("local-peer-ID").innerText = id;
});

document.getElementById("call-btn").addEventListener("click", makeCall);

document.getElementById("cast-btn").addEventListener("click", () => {
	const getUserMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || (navigator.mediaDevices && navigator.mediaDevices.getUserMedia)).bind(navigator);
    getUserMedia({video: false, audio:true}, (stream) => {
		window.localStream = stream;
		document.getElementById("cast-btn").style.display = "none";
		document.getElementById("cast-ready").style.display = "block";
    }, (err) => {
        console.log("Failed to get user media", err)
    })
})

function makeCall() {  
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

navigator.geolocation.getCurrentPosition((position) => {
  console.log("Position is " + position.coords.latitude + " " + position.coords.longitude)
});