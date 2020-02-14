'use strict'
import './main.scss';
import './modules/speak';
import './modules/autocomplete'; 
import makeMap from './modules/map';
import { $, $$ } from './modules/bling'
import { removeFlash } from './modules/flashes'

$('#map') && makeMap($('#map'));
/*
const callButton = $("#call-btn");
callButton && callButton.on("click", makeCall);

const castButton = $("#cast-btn");
castButton && castButton.on("click", prepareForCast);

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
*/