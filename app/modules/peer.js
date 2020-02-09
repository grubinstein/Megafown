'use strict'

let peer;
let stream;

const createPeer = () => new Promise((resolve, reject) => {
    peer = new Peer();
    peer.on('open', resolve);
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

export { createPeer, getPeerId, destroyPeer, getAudioStream };