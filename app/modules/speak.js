'use strict'
require('regenerator-runtime/runtime');
import axios from 'axios';
import { $ } from './bling';
import { getLocation } from './location';
import { catchErrors, newUserFriendlyError } from './errorHandling';
import { createPeer, getPeerID, destroyPeer, getAudioStream } from './peer';

let castID;


$("#castBtn") && $("#castBtn").on("click", async (e) => {
	e.preventDefault();
	await catchErrors(prepareForCast, {
		msg: "Error occurred while preparing cast. Did you provide permission to use audio? Have you given your location?",
		onFail: destroyPeer
	})();
});


const prepareForCast = async () => {
	const [ localPeer ] =  await Promise.all([ createPeer(), getAudioStream() ]);
	await sendCastData(localPeer);
	toggleSuccess();

    window.addEventListener('unload', endCast);
}

const endCast = async () => {
	destroyPeer();
	await deleteCast();
	toggleSuccess();
}

$("#stopCastBtn") && $("#stopCastBtn").on("click", catchErrors(endCast, {msg: "Error occured while deleting cast"} ));

const sendCastData = async (localPeerID) => {
	const coordinates = getLocation();
	const cast = {
		name: $("#castName").value,
		coordinates,
		localPeerID
	};
	
	axios.post('/api/new-cast', cast)
	.then(function(res) {
		castID = res.data;
	})
	.catch(() => {
		newUserFriendlyError("Error while sending cast data to server.")
	});
}

const toggleSuccess = () => {
	$(".cast-form").classList.toggle("d-none");
	$(".success").classList.toggle("d-none");
}

const deleteCast = async () => {
	const peerID = getPeerID();
	await axios.post("/api/end-cast", { castID, peerID })
}